const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("node:crypto");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://ooaoooa4562-beep.github.io";
const FRONTEND_URL = (process.env.FRONTEND_URL || FRONTEND_ORIGIN + "/nexus").replace(/\/+$/, "");
const COOKIE_NAME = "nexus_github_session";
const STATE_COOKIE = "nexus_oauth_state";
const SESSION_TTL = 8 * 60 * 60;
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_AVATAR_BYTES = 1024 * 1024;
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }, max: 5, connectionTimeoutMillis: 8000 }) : null;
let schemaReady;

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "2.5mb" }));
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
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
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

app.get("/health", (_req, res) => res.json({ ok: true, service: "NEXUS GitHub API", version: "0.2.0", socialDatabaseConfigured: Boolean(pool) }));
app.get("/auth/google", (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.API_BASE_URL) return res.status(503).send("Google OAuth is not configured.");
  const state = crypto.randomBytes(24).toString("hex");
  res.setHeader("Set-Cookie", STATE_COOKIE + "=" + encodeURIComponent(state + "." + sign(state)) + "; " + cookieOptions(600));
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", process.env.API_BASE_URL + "/auth/google/callback");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  res.redirect(url.toString());
});
app.get("/auth/google/callback", async (req, res) => {
  const saved = parseCookies(req)[STATE_COOKIE] || "";
  clearCookie(res, STATE_COOKIE);
  try {
    const pair = saved.split(".");
    if (!req.query.state || !safeEqual(req.query.state, pair[0]) || !safeEqual(sign(pair[0]), pair[1])) return res.status(400).send("OAuth state validation failed.");
    if (req.query.error) return res.redirect(FRONTEND_URL + "/?auth=google-cancelled");
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.API_BASE_URL || typeof req.query.code !== "string") return res.status(503).send("Google OAuth is not fully configured.");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: req.query.code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: process.env.API_BASE_URL + "/auth/google/callback", grant_type: "authorization_code" }) });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.access_token) throw new Error("Google authorization failed.");
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: "Bearer " + tokens.access_token } });
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.email || profile.verified_email !== true) throw new Error("Google did not return a verified email address.");
    const session = seal({ provider: "google", googleId: String(profile.id), email: profile.email, login: profile.name || profile.email, avatarUrl: profile.picture || "", expiresAt: Date.now() + SESSION_TTL * 1000 });
    res.append("Set-Cookie", COOKIE_NAME + "=" + encodeURIComponent(session) + "; " + cookieOptions(SESSION_TTL));
    res.redirect(FRONTEND_URL + "/?auth=google-connected");
  } catch (error) { res.status(400).send(error.message || "Google authorization failed."); }
});
function emailConfigReady() { return Boolean(pool && process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.API_BASE_URL); }
async function ensureEmailAuthSchema() {
  if (!pool) throw Object.assign(new Error("Email sign-in requires DATABASE_URL."), { status: 503 });
  await pool.query("CREATE TABLE IF NOT EXISTS nexus_email_accounts (email TEXT PRIMARY KEY, password_hash TEXT NOT NULL, verified BOOLEAN NOT NULL DEFAULT FALSE, verification_hash TEXT, verification_expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
}
function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error("Enter a valid email address."), { status: 400 });
  return email;
}
function passwordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  return salt + ":" + crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex");
}
function passwordMatches(password, stored) {
  const [salt, expected] = String(stored || "").split(":");
  if (!salt || !expected) return false;
  const actual = Buffer.from(passwordHash(password, salt).split(":")[1], "hex"), wanted = Buffer.from(expected, "hex");
  return actual.length === wanted.length && crypto.timingSafeEqual(actual, wanted);
}
async function sendVerificationEmail(email, token) {
  if (!emailConfigReady()) throw Object.assign(new Error("Add RESEND_API_KEY, EMAIL_FROM and DATABASE_URL to Render to enable email sign-in."), { status: 503 });
  const verifyUrl = process.env.API_BASE_URL + "/auth/email/verify?token=" + encodeURIComponent(token);
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email], subject: "Verify your NEXUS account", html: "<p>Welcome to NEXUS.</p><p><a href=\"" + verifyUrl + "\">Verify your email address</a></p><p>If you did not request this, ignore this message.</p>" }) });
  if (!response.ok) throw Object.assign(new Error("Could not send verification email. Check the Resend configuration."), { status: 502 });
}
app.post("/auth/email/register", async (req, res) => {
  try {
    if (!emailConfigReady()) return res.status(503).json({ error: "Email sign-in is not configured. Add DATABASE_URL, RESEND_API_KEY and EMAIL_FROM in Render." });
    await ensureEmailAuthSchema();
    const email = normalizeEmail(req.body && req.body.email), password = String(req.body && req.body.password || "");
    if (password.length < 10 || password.length > 200) return res.status(400).json({ error: "Password must contain 10–200 characters." });
    const token = crypto.randomBytes(32).toString("hex"), hash = crypto.createHash("sha256").update(token).digest("hex");
    const saved = await pool.query("INSERT INTO nexus_email_accounts (email,password_hash,verification_hash,verification_expires_at) VALUES ($1,$2,$3,NOW()+INTERVAL '30 minutes') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,verified=FALSE,verification_hash=EXCLUDED.verification_hash,verification_expires_at=EXCLUDED.verification_expires_at WHERE nexus_email_accounts.verified=FALSE RETURNING email", [email, passwordHash(password), hash]);
    if (!saved.rows.length) return res.status(409).json({ error: "An account with this email already exists. Sign in instead." });
    await sendVerificationEmail(email, token);
    res.status(202).json({ ok: true, message: "Verification link sent. Check your email." });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not create email account." }); }
});
app.get("/auth/email/verify", async (req, res) => {
  try {
    await ensureEmailAuthSchema();
    const token = String(req.query.token || "");
    if (!/^[a-f0-9]{64}$/.test(token)) return res.status(400).send("Invalid verification link.");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const result = await pool.query("UPDATE nexus_email_accounts SET verified=TRUE,verification_hash=NULL,verification_expires_at=NULL WHERE verification_hash=$1 AND verification_expires_at>NOW() RETURNING email", [hash]);
    if (!result.rows.length) return res.status(400).send("This verification link has expired or was already used.");
    const email = result.rows[0].email;
    const session = seal({ provider: "email", email, login: email, expiresAt: Date.now() + SESSION_TTL * 1000 });
    res.append("Set-Cookie", COOKIE_NAME + "=" + encodeURIComponent(session) + "; " + cookieOptions(SESSION_TTL));
    res.redirect(FRONTEND_URL + "/?auth=email-connected");
  } catch (error) { res.status(error.status || 500).send("Email verification could not be completed."); }
});
app.post("/auth/email/login", async (req, res) => {
  try {
    await ensureEmailAuthSchema();
    const email = normalizeEmail(req.body && req.body.email), password = String(req.body && req.body.password || "");
    const result = await pool.query("SELECT password_hash,verified FROM nexus_email_accounts WHERE email=$1", [email]);
    if (!result.rows.length || !passwordMatches(password, result.rows[0].password_hash)) return res.status(401).json({ error: "Email or password is incorrect." });
    if (!result.rows[0].verified) return res.status(403).json({ error: "Verify your email address before signing in." });
    const session = seal({ provider: "email", email, login: email, expiresAt: Date.now() + SESSION_TTL * 1000 });
    res.append("Set-Cookie", COOKIE_NAME + "=" + encodeURIComponent(session) + "; " + cookieOptions(SESSION_TTL));
    res.json({ ok: true, provider: "email", email });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Email sign-in failed." }); }
});
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
    const session = seal({ accessToken: tokenData.access_token, githubId: String(profile.id), login: profile.login, avatarUrl: profile.avatar_url, expiresAt: Date.now() + SESSION_TTL * 1000 });
    res.append("Set-Cookie", COOKIE_NAME + "=" + encodeURIComponent(session) + "; " + cookieOptions(SESSION_TTL));
    res.redirect(FRONTEND_URL + "/?github=connected");
  } catch (error) { res.status(400).send(error.message || "GitHub authorization failed."); }
});
app.post("/auth/logout", (req, res) => {
  clearCookie(res, COOKIE_NAME);
  res.json({ ok: true });
});
app.get("/api/me", (req, res) => { const session = getSession(req); res.json({ connected: Boolean(session), provider: session ? (session.provider || "github") : null, user: session ? { login: session.login, email: session.email || null, avatarUrl: session.avatarUrl || "" } : null }); });
  const session = getSession(req);
  res.json({ connected: Boolean(session), user: session ? { login: session.login, avatarUrl: session.avatarUrl } : null });
});
app.get("/api/repos", requireSession, async (req, res) => {
  try {
    const repos = await githubRequest("/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member", req.github.accessToken);
    res.json({ repositories: repos.map(repo => ({ fullName: repo.full_name, name: repo.name, private: repo.private, defaultBranch: repo.default_branch, htmlUrl: repo.html_url, permissions: repo.permissions || {} })) });
  } catch (error) { safeError(res, error); }
});
function validBranchName(value) {
  return typeof value === "string" && value.length <= 240 && !value.startsWith("/") && !value.endsWith("/") && !value.includes("\\") && !value.includes("..") && !/[\s~^:?*\[\]\x00-\x20]/.test(value) && !value.endsWith(".lock");
}
app.get("/api/branches", requireSession, async (req, res) => {
  try {
    const repository = req.query.repository;
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    const branches = await githubRequest("/repos/" + repository + "/branches?per_page=100", req.github.accessToken);
    res.json({ repository, branches: branches.map(item => ({ name: item.name, protected: item.protected, sha: item.commit && item.commit.sha })) });
  } catch (error) { safeError(res, error); }
});
app.post("/api/branches", requireSession, async (req, res) => {
  try {
    const body = req.body || {}, repository = body.repository, name = body.name, from = body.from;
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    if (!validBranchName(name)) return res.status(400).json({ error: "Invalid branch name." });
    const repo = await githubRequest("/repos/" + repository, req.github.accessToken);
    const source = validBranchName(from) ? from : repo.default_branch;
    const base = await githubRequest("/repos/" + repository + "/branches/" + encodeURIComponent(source), req.github.accessToken);
    const result = await githubRequest("/repos/" + repository + "/git/refs", req.github.accessToken, {
      method: "POST", body: JSON.stringify({ ref: "refs/heads/" + name, sha: base.commit.sha })
    });
    res.status(201).json({ ok: true, repository, branch: name, sha: result.object.sha });
  } catch (error) { safeError(res, error); }
});
app.delete("/api/branches", requireSession, async (req, res) => {
  try {
    const repository = req.query.repository, name = req.query.name;
    if (!validRepoName(repository) || !validBranchName(name)) return res.status(400).json({ error: "Repository and valid branch name are required." });
    const repo = await githubRequest("/repos/" + repository, req.github.accessToken);
    if (name === repo.default_branch) return res.status(400).json({ error: "The default branch cannot be deleted." });
    await githubRequest("/repos/" + repository + "/git/refs/heads/" + name.split("/").map(encodeURIComponent).join("/"), req.github.accessToken, { method: "DELETE" });
    res.json({ ok: true, deleted: name });
  } catch (error) { safeError(res, error); }
});
app.get("/api/tree", requireSession, async (req, res) => {
  try {
    const repository = req.query.repository;
    const path = typeof req.query.path === "string" ? req.query.path : "";
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    if (path && !validPath(path)) return res.status(400).json({ error: "Invalid directory path." });
    const repo = await githubRequest("/repos/" + repository, req.github.accessToken);
    const branch = typeof req.query.branch === "string" && req.query.branch.trim() ? req.query.branch.trim() : repo.default_branch;
    const endpoint = "/repos/" + repository + "/contents" + (path ? "/" + path.split("/").map(encodeURIComponent).join("/") : "") + "?ref=" + encodeURIComponent(branch);
    const result = await githubRequest(endpoint, req.github.accessToken);
    if (!Array.isArray(result)) return res.status(400).json({ error: "The requested path is not a directory." });
    res.json({ repository, branch, path, items: result.map(item => ({ name: item.name, path: item.path, type: item.type, size: item.size, sha: item.sha })) });
  } catch (error) { safeError(res, error); }
});
app.get("/api/file", requireSession, async (req, res) => {
  try {
    const repository = req.query.repository, path = req.query.path;
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    if (!validPath(path)) return res.status(400).json({ error: "Invalid file path." });
    const repo = await githubRequest("/repos/" + repository, req.github.accessToken);
    const branch = typeof req.query.branch === "string" && req.query.branch.trim() ? req.query.branch.trim() : repo.default_branch;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const file = await githubRequest("/repos/" + repository + "/contents/" + encodedPath + "?ref=" + encodeURIComponent(branch), req.github.accessToken);
    if (file.type !== "file") return res.status(400).json({ error: "The requested path is not a file." });
    if (file.size > MAX_FILE_BYTES) return res.status(413).json({ error: "Files larger than 1 MB cannot be opened in the editor." });
    if (typeof file.content !== "string") return res.status(400).json({ error: "This file is not available as readable text." });
    const content = Buffer.from(file.content, "base64").toString("utf8");
    res.json({ repository, branch, path: file.path, name: file.name, sha: file.sha, content, size: file.size });
  } catch (error) { safeError(res, error); }
});
app.put("/api/files", requireSession, async (req, res) => {
  try {
    const body = req.body || {};
    const repository = body.repository, path = body.path, content = body.content, sha = body.sha;
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    if (!validPath(path)) return res.status(400).json({ error: "Invalid file path." });
    if (typeof content !== "string" || Buffer.byteLength(content, "utf8") > MAX_FILE_BYTES) return res.status(400).json({ error: "File content must be text up to 1 MB." });
    if (typeof sha !== "string" || !/^[a-f0-9]{40}$/i.test(sha)) return res.status(400).json({ error: "A valid current file SHA is required to save." });
    const repo = await githubRequest("/repos/" + repository, req.github.accessToken);
    const branch = typeof body.branch === "string" && body.branch.trim() ? body.branch.trim() : repo.default_branch;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const result = await githubRequest("/repos/" + repository + "/contents/" + encodedPath, req.github.accessToken, {
      method: "PUT",
      body: JSON.stringify({ message: body.message || ("Update " + path), content: Buffer.from(content, "utf8").toString("base64"), sha, branch })
    });
    res.json({ ok: true, path, branch, sha: result.content.sha, commit: result.commit.sha, url: result.content.html_url });
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
async function ensureSchema() {
  if (!pool) throw Object.assign(new Error("NEXUS social database is not configured. Set DATABASE_URL on the Render service."), { status: 503 });
  if (!schemaReady) schemaReady = pool.query(
    "CREATE TABLE IF NOT EXISTS nexus_users (github_id TEXT PRIMARY KEY, public_id TEXT NOT NULL UNIQUE, github_login TEXT NOT NULL, display_name VARCHAR(32) NOT NULL, bio VARCHAR(160) NOT NULL DEFAULT '', avatar_url TEXT NOT NULL DEFAULT '', avatar_data TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());" +
    "CREATE TABLE IF NOT EXISTS nexus_friendships (id BIGSERIAL PRIMARY KEY, requester_id TEXT NOT NULL REFERENCES nexus_users(github_id) ON DELETE CASCADE, addressee_id TEXT NOT NULL REFERENCES nexus_users(github_id) ON DELETE CASCADE, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CHECK (requester_id <> addressee_id), UNIQUE (requester_id, addressee_id));" +
    "CREATE INDEX IF NOT EXISTS nexus_friendships_addressee_status_idx ON nexus_friendships(addressee_id, status);" +
    "CREATE INDEX IF NOT EXISTS nexus_friendships_requester_status_idx ON nexus_friendships(requester_id, status);"
  ).catch(error => { schemaReady = null; throw error; });
  await schemaReady;
}
function makePublicId() { return "NX-" + crypto.randomBytes(5).toString("hex").toUpperCase(); }
async function ensureNexusUser(session) {
  await ensureSchema();
  let profile = null;
  if (!session.githubId) profile = await githubRequest("/user", session.accessToken);
  const githubId = String(session.githubId || profile.id);
  const login = session.login || profile.login || "github-user";
  const avatarUrl = session.avatarUrl || profile.avatar_url || "";
  let result = await pool.query("SELECT * FROM nexus_users WHERE github_id=$1", [githubId]);
  if (!result.rows.length) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        result = await pool.query("INSERT INTO nexus_users (github_id,public_id,github_login,display_name,avatar_url) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (github_id) DO UPDATE SET github_login=EXCLUDED.github_login, updated_at=NOW() RETURNING *", [githubId, makePublicId(), login, profile && profile.name ? profile.name.slice(0,32) : login.slice(0,32), avatarUrl]);
        break;
      } catch (error) { if (error.code !== "23505" || attempt === 3) throw error; }
    }
  } else {
    result = await pool.query("UPDATE nexus_users SET github_login=$2, avatar_url=CASE WHEN avatar_data='' THEN $3 ELSE avatar_url END, updated_at=NOW() WHERE github_id=$1 RETURNING *", [githubId, login, avatarUrl]);
  }
  return result.rows[0];
}
function publicUser(row) {
  return { id: row.public_id, displayName: row.display_name, bio: row.bio, avatarUrl: row.avatar_data || row.avatar_url || "", githubLogin: row.github_login, createdAt: row.created_at };
}
function requireSocialUser(req, res, next) {
  const session = getSession(req);
  if (!session || !session.accessToken) {
    clearCookie(res, COOKIE_NAME);
    return res.status(401).json({ error: "Connect your GitHub account to use NEXUS profiles and friends." });
  }
  req.github = session;
  ensureNexusUser(session).then(user => { req.nexusUser = user; next(); }).catch(error => {
    console.error("[NEXUS social]", error.message);
    res.status(error.status || 500).json({ error: error.status === 503 ? error.message : "Could not load your NEXUS account. Check database configuration." });
  });
}
app.get("/api/profile", requireSocialUser, (req, res) => res.json({ profile: publicUser(req.nexusUser) }));
app.put("/api/profile", requireSocialUser, async (req, res) => {
  try {
    const body = req.body || {};
    const name = typeof body.displayName === "string" ? body.displayName.trim() : "";
    const bio = typeof body.bio === "string" ? body.bio.trim() : "";
    const avatar = typeof body.avatar === "string" ? body.avatar : "";
    if (!name || name.length > 32) return res.status(400).json({ error: "Display name must contain 1–32 characters." });
    if (bio.length > 160) return res.status(400).json({ error: "Bio must be 160 characters or fewer." });
    if (avatar && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(avatar)) return res.status(400).json({ error: "Avatar must be a PNG, JPEG or WebP image." });
    if (Buffer.byteLength(avatar, "utf8") > Math.ceil(MAX_AVATAR_BYTES * 1.4)) return res.status(413).json({ error: "Avatar must be smaller than 1 MB." });
    const saved = await pool.query("UPDATE nexus_users SET display_name=$2,bio=$3,avatar_data=$4,updated_at=NOW() WHERE github_id=$1 RETURNING *", [req.nexusUser.github_id, name, bio, avatar]);
    res.json({ ok: true, profile: publicUser(saved.rows[0]) });
  } catch (error) { console.error("[NEXUS profile]", error.message); res.status(500).json({ error: "Could not save profile." }); }
});
app.get("/api/social/search", requireSocialUser, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toUpperCase();
    if (q.length < 3 || q.length > 40) return res.status(400).json({ error: "Enter at least 3 characters of a NEXUS ID." });
    const result = await pool.query("SELECT * FROM nexus_users WHERE public_id LIKE $1 AND github_id<>$2 ORDER BY public_id LIMIT 10", [q.replace(/[\\%_]/g, "\\$&") + "%", req.nexusUser.github_id]);
    res.json({ users: result.rows.map(publicUser) });
  } catch (error) { console.error("[NEXUS search]", error.message); res.status(500).json({ error: "Could not search users." }); }
});
app.get("/api/social/friends", requireSocialUser, async (req, res) => {
  try {
    const r = await pool.query("SELECT u.* FROM nexus_friendships f JOIN nexus_users u ON u.github_id=CASE WHEN f.requester_id=$1 THEN f.addressee_id ELSE f.requester_id END WHERE (f.requester_id=$1 OR f.addressee_id=$1) AND f.status='accepted' ORDER BY u.display_name", [req.nexusUser.github_id]);
    res.json({ friends: r.rows.map(publicUser) });
  } catch (error) { console.error("[NEXUS friends]", error.message); res.status(500).json({ error: "Could not load friends." }); }
});
app.get("/api/social/requests", requireSocialUser, async (req, res) => {
  try {
    const [incoming, outgoing] = await Promise.all([
      pool.query("SELECT f.id AS request_id,f.created_at,u.* FROM nexus_friendships f JOIN nexus_users u ON u.github_id=f.requester_id WHERE f.addressee_id=$1 AND f.status='pending' ORDER BY f.created_at DESC", [req.nexusUser.github_id]),
      pool.query("SELECT f.id AS request_id,f.created_at,u.* FROM nexus_friendships f JOIN nexus_users u ON u.github_id=f.addressee_id WHERE f.requester_id=$1 AND f.status='pending' ORDER BY f.created_at DESC", [req.nexusUser.github_id])
    ]);
    res.json({ incoming: incoming.rows.map(r => ({ requestId: r.request_id, createdAt: r.created_at, user: publicUser(r) })), outgoing: outgoing.rows.map(r => ({ requestId: r.request_id, createdAt: r.created_at, user: publicUser(r) })) });
  } catch (error) { console.error("[NEXUS requests]", error.message); res.status(500).json({ error: "Could not load friend requests." }); }
});
app.post("/api/social/requests", requireSocialUser, async (req, res) => {
  try {
    const id = String((req.body || {}).targetId || "").trim().toUpperCase();
    if (!/^NX-[A-F0-9]{10}$/.test(id)) return res.status(400).json({ error: "Enter a valid NEXUS user ID." });
    const found = await pool.query("SELECT github_id FROM nexus_users WHERE public_id=$1", [id]);
    if (!found.rows.length) return res.status(404).json({ error: "No NEXUS user found with that ID." });
    const target = found.rows[0].github_id;
    if (target === req.nexusUser.github_id) return res.status(400).json({ error: "You cannot add yourself." });
    const existing = await pool.query("SELECT * FROM nexus_friendships WHERE (requester_id=$1 AND addressee_id=$2) OR (requester_id=$2 AND addressee_id=$1)", [req.nexusUser.github_id, target]);
    if (existing.rows.length) {
      const f = existing.rows[0];
      if (f.status === "accepted") return res.status(409).json({ error: "You are already friends." });
      if (f.status === "pending") return res.status(409).json({ error: f.requester_id === req.nexusUser.github_id ? "Friend request already sent." : "This user has already sent you a request. Check incoming requests." });
      await pool.query("DELETE FROM nexus_friendships WHERE id=$1", [f.id]);
    }
    await pool.query("INSERT INTO nexus_friendships (requester_id,addressee_id,status) VALUES ($1,$2,'pending')", [req.nexusUser.github_id, target]);
    res.status(201).json({ ok: true, message: "Friend request sent." });
  } catch (error) { console.error("[NEXUS send request]", error.message); res.status(500).json({ error: "Could not send friend request." }); }
});
app.patch("/api/social/requests/:requestId", requireSocialUser, async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.requestId)) return res.status(400).json({ error: "Invalid friend request ID." });
    const action = String((req.body || {}).action || "");
    if (!["accept", "decline"].includes(action)) return res.status(400).json({ error: "Action must be accept or decline." });
    const status = action === "accept" ? "accepted" : "declined";
    const r = await pool.query("UPDATE nexus_friendships SET status=$3,updated_at=NOW() WHERE id=$1 AND addressee_id=$2 AND status='pending' RETURNING id", [req.params.requestId, req.nexusUser.github_id, status]);
    if (!r.rows.length) return res.status(404).json({ error: "Incoming request not found or already handled." });
    res.json({ ok: true, status });
  } catch (error) { console.error("[NEXUS respond request]", error.message); res.status(500).json({ error: "Could not update friend request." }); }
});
app.delete("/api/social/friends/:publicId", requireSocialUser, async (req, res) => {
  try {
    const target = await pool.query("SELECT github_id FROM nexus_users WHERE public_id=$1", [String(req.params.publicId || "").toUpperCase()]);
    if (!target.rows.length) return res.status(404).json({ error: "Friend not found." });
    const r = await pool.query("DELETE FROM nexus_friendships WHERE status='accepted' AND ((requester_id=$1 AND addressee_id=$2) OR (requester_id=$2 AND addressee_id=$1)) RETURNING id", [req.nexusUser.github_id, target.rows[0].github_id]);
    if (!r.rows.length) return res.status(404).json({ error: "Friendship not found." });
    res.json({ ok: true });
  } catch (error) { console.error("[NEXUS remove friend]", error.message); res.status(500).json({ error: "Could not remove friend." }); }
});


async function migrateExistingDataToNeon() {
  if (!pool) throw new Error("Source DATABASE_URL is not configured.");
  if (!process.env.NEON_DATABASE_URL) throw new Error("NEON_DATABASE_URL is not configured.");
  const target = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: process.env.NEON_DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    max: 2,
    connectionTimeoutMillis: 10000
  });
  const client = await target.connect();
  try {
    await client.query("BEGIN");
    await client.query("CREATE TABLE IF NOT EXISTS nexus_users (github_id TEXT PRIMARY KEY, public_id TEXT NOT NULL UNIQUE, github_login TEXT NOT NULL, display_name VARCHAR(32) NOT NULL, bio VARCHAR(160) NOT NULL DEFAULT '', avatar_url TEXT NOT NULL DEFAULT '', avatar_data TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
    await client.query("CREATE TABLE IF NOT EXISTS nexus_friendships (id BIGSERIAL PRIMARY KEY, requester_id TEXT NOT NULL REFERENCES nexus_users(github_id) ON DELETE CASCADE, addressee_id TEXT NOT NULL REFERENCES nexus_users(github_id) ON DELETE CASCADE, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CHECK (requester_id <> addressee_id), UNIQUE (requester_id, addressee_id))");
    await client.query("CREATE INDEX IF NOT EXISTS nexus_friendships_addressee_status_idx ON nexus_friendships(addressee_id,status)");
    await client.query("CREATE INDEX IF NOT EXISTS nexus_friendships_requester_status_idx ON nexus_friendships(requester_id,status)");
    const users = await pool.query("SELECT github_id,public_id,github_login,display_name,bio,avatar_url,avatar_data,created_at,updated_at FROM nexus_users ORDER BY github_id");
    const friendships = await pool.query("SELECT id,requester_id,addressee_id,status,created_at,updated_at FROM nexus_friendships ORDER BY id");
    for (const u of users.rows) await client.query("INSERT INTO nexus_users (github_id,public_id,github_login,display_name,bio,avatar_url,avatar_data,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (github_id) DO UPDATE SET public_id=EXCLUDED.public_id,github_login=EXCLUDED.github_login,display_name=EXCLUDED.display_name,bio=EXCLUDED.bio,avatar_url=EXCLUDED.avatar_url,avatar_data=EXCLUDED.avatar_data,created_at=EXCLUDED.created_at,updated_at=EXCLUDED.updated_at", [u.github_id,u.public_id,u.github_login,u.display_name,u.bio,u.avatar_url,u.avatar_data,u.created_at,u.updated_at]);
    for (const f of friendships.rows) await client.query("INSERT INTO nexus_friendships (id,requester_id,addressee_id,status,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (requester_id,addressee_id) DO UPDATE SET status=EXCLUDED.status,created_at=EXCLUDED.created_at,updated_at=EXCLUDED.updated_at", [f.id,f.requester_id,f.addressee_id,f.status,f.created_at,f.updated_at]);
    await client.query("SELECT setval(pg_get_serial_sequence('nexus_friendships','id'), GREATEST(COALESCE((SELECT MAX(id) FROM nexus_friendships),1),1), EXISTS(SELECT 1 FROM nexus_friendships))");
    const targetUsers = await client.query("SELECT COUNT(*)::int AS count FROM nexus_users");
    const targetFriendships = await client.query("SELECT COUNT(*)::int AS count FROM nexus_friendships");
    const counts = { sourceUsers: users.rowCount, targetUsers: targetUsers.rows[0].count, sourceFriendships: friendships.rowCount, targetFriendships: targetFriendships.rows[0].count };
    if (counts.sourceUsers !== counts.targetUsers || counts.sourceFriendships !== counts.targetFriendships) throw new Error("Migration verification failed: source and target row counts differ.");
    await client.query("COMMIT");
    console.log("[NEXUS migration] verified", JSON.stringify(counts));
    return counts;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await target.end();
  }
}

app.use((error, _req, res, _next) => {
  console.error("[NEXUS API]", error.message);
  res.status(500).json({ error: "Internal server error." });
});
async function startServer() {
  if (process.env.RUN_NEON_MIGRATION === "true") {
    try {
      const counts = await migrateExistingDataToNeon();
      console.log("[NEXUS migration] COMPLETE", JSON.stringify(counts));
    } catch (error) {
      console.error("[NEXUS migration] FAILED", error.message);
      process.exitCode = 1;
      throw error;
    }
  }
  app.listen(PORT, "0.0.0.0", () => console.log("NEXUS GitHub API listening on " + PORT));
}
startServer();
