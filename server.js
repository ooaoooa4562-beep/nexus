const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("node:crypto");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://ooaoooa4562-beep.github.io";
const FRONTEND_URL = (process.env.FRONTEND_URL || FRONTEND_ORIGIN + "/nexus").replace(/\/+$/, "");
const COOKIE_NAME = "nexus_github_session";
const STATE_COOKIE = "nexus_oauth_state";
const SESSION_TTL = 8 * 60 * 60;
const MAX_FILE_BYTES = 1024 * 1024;

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "1.2mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 180, standardHeaders: "draft-7", legacyHeaders: false }));

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function cookieOptions(maxAge) {
  return "Path=/; HttpOnly; Secure; SameSite=None; Max-Age=" + maxAge;
}
function clearCookie(res, name) {
  res.append("Set-Cookie", name + "=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0");
}
function configReady() {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.SESSION_SECRET && process.env.API_BASE_URL);
}
function secretKey() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return crypto.createHash("sha256").update(process.env.SESSION_SECRET).digest();
}
function sign(value) {
  return crypto.createHmac("sha256", secretKey()).update(value).digest("base64url");
}
function safeEqual(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function seal(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload)), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), body.toString("base64url")].join(".");
}
function unseal(value) {
  try {
    const parts = String(value || "").split(".");
    if (parts.length !== 3) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(parts[0], "base64url"));
    decipher.setAuthTag(Buffer.from(parts[1], "base64url"));
    const plain = Buffer.concat([decipher.update(Buffer.from(parts[2], "base64url")), decipher.final()]);
    const session = JSON.parse(plain.toString("utf8"));
    return session.expiresAt > Date.now() ? session : null;
  } catch { return null; }
}
function getSession(req) {
  const value = parseCookies(req)[COOKIE_NAME];
  return value ? unseal(value) : null;
}
function requireSession(req, res, next) {
  const session = getSession(req);
  if (!session || !session.accessToken) {
    clearCookie(res, COOKIE_NAME);
    return res.status(401).json({ error: "Connect your GitHub account first." });
  }
  req.github = session;
  next();
}
function originAllowed(req) {
  const origin = req.headers.origin;
  return !origin || origin === FRONTEND_ORIGIN || origin === "http://localhost:5500" || origin === "http://127.0.0.1:5500";
}
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && originAllowed(req)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && !originAllowed(req)) return res.status(403).json({ error: "Origin not allowed." });
  next();
});
async function githubRequest(path, token, options = {}) {
  const response = await fetch("https://api.github.com" + path, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || ("GitHub API returned " + response.status));
    error.status = response.status;
    throw error;
  }
  return data;
}
function validRepoName(value) {
  return typeof value === "string" && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value);
}
function validPath(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 240) return false;
  if (value.startsWith("/") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return false;
  return value.split("/").every(part => part && part !== "." && part !== "..");
}
function safeError(res, error) {
  const status = error.status && error.status >= 400 && error.status < 500 ? error.status : 502;
  res.status(status).json({ error: error.message || "GitHub request failed." });
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "NEXUS GitHub API", version: "0.1.0" }));
app.get("/auth/github", (req, res) => {
  if (!configReady()) return res.status(503).send("GitHub OAuth is not configured yet.");
  const state = crypto.randomBytes(24).toString("hex");
  const signed = state + "." + sign(state);
  res.setHeader("Set-Cookie", STATE_COOKIE + "=" + encodeURIComponent(signed) + "; " + cookieOptions(600));
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", process.env.API_BASE_URL + "/auth/github/callback");
  url.searchParams.set("scope", "read:user repo");
  url.searchParams.set("state", state);
  res.redirect(url.toString());
});
app.get("/auth/github/callback", async (req, res) => {
  const saved = parseCookies(req)[STATE_COOKIE] || "";
  clearCookie(res, STATE_COOKIE);
  try {
    if (!configReady()) return res.status(503).send("GitHub OAuth is not configured yet.");
    const pair = saved.split(".");
    if (!req.query.state || !safeEqual(req.query.state, pair[0]) || !safeEqual(sign(pair[0]), pair[1])) return res.status(400).send("OAuth state validation failed. Return to NEXUS and try again.");
    if (req.query.error) return res.redirect(FRONTEND_URL + "/?github=cancelled");
    if (typeof req.query.code !== "string") return res.status(400).send("Missing OAuth code.");
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code: req.query.code })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) throw new Error(tokenData.error_description || "GitHub authorization failed.");
    const profile = await githubRequest("/user", tokenData.access_token);
    const session = seal({ accessToken: tokenData.access_token, login: profile.login, avatarUrl: profile.avatar_url, expiresAt: Date.now() + SESSION_TTL * 1000 });
    res.append("Set-Cookie", COOKIE_NAME + "=" + encodeURIComponent(session) + "; " + cookieOptions(SESSION_TTL));
    res.redirect(FRONTEND_URL + "/?github=connected");
  } catch (error) { res.status(400).send(error.message || "GitHub authorization failed."); }
});
app.post("/auth/logout", requireSession, (req, res) => {
  clearCookie(res, COOKIE_NAME);
  res.json({ ok: true });
});
app.get("/api/me", (req, res) => {
  const session = getSession(req);
  res.json({ connected: Boolean(session), user: session ? { login: session.login, avatarUrl: session.avatarUrl } : null });
});
app.get("/api/repos", requireSession, async (req, res) => {
  try {
    const repos = await githubRequest("/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member", req.github.accessToken);
    res.json({ repositories: repos.map(repo => ({ fullName: repo.full_name, name: repo.name, private: repo.private, defaultBranch: repo.default_branch, htmlUrl: repo.html_url, permissions: repo.permissions || {} })) });
  } catch (error) { safeError(res, error); }
});
app.post("/api/files", requireSession, async (req, res) => {
  try {
    const body = req.body || {};
    const repository = body.repository, path = body.path, content = body.content;
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    if (!validPath(path)) return res.status(400).json({ error: "Invalid file path." });
    if (typeof content !== "string" || Buffer.byteLength(content, "utf8") > MAX_FILE_BYTES) return res.status(400).json({ error: "File content must be text up to 1 MB." });
    const repo = await githubRequest("/repos/" + repository, req.github.accessToken);
    const targetBranch = typeof body.branch === "string" && body.branch.trim() ? body.branch.trim() : repo.default_branch;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    let existing = null;
    try { existing = await githubRequest("/repos/" + repository + "/contents/" + encodedPath + "?ref=" + encodeURIComponent(targetBranch), req.github.accessToken); }
    catch (error) { if (error.status !== 404) throw error; }
    if (existing) return res.status(409).json({ error: "That file already exists. Use a separate update command." });
    const result = await githubRequest("/repos/" + repository + "/contents/" + encodedPath, req.github.accessToken, {
      method: "PUT",
      body: JSON.stringify({ message: body.message || ("Create " + path), content: Buffer.from(content, "utf8").toString("base64"), branch: targetBranch })
    });
    res.status(201).json({ ok: true, path, branch: targetBranch, commit: result.commit.sha, url: result.content.html_url });
  } catch (error) { safeError(res, error); }
});
app.use((error, _req, res, _next) => {
  console.error("[NEXUS API]", error.message);
  res.status(500).json({ error: "Internal server error." });
});
app.listen(PORT, "0.0.0.0", () => console.log("NEXUS GitHub API listening on " + PORT));
