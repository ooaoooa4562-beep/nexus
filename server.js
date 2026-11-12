const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("node:crypto");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const FRONTEND_ORIGIN = "https://ooaoooa4562-beep.github.io";
const API_BASE_URL = "https://nexus-github-api.onrender.com";
const FRONTEND_URL = (() => {
  const configured = process.env.FRONTEND_URL || FRONTEND_ORIGIN + "/nexus";
  try {
    const parsed = new URL(configured);
    if (parsed.hostname === "ooaoooa4562-beep.github.io" && parsed.pathname === "/") parsed.pathname = "/nexus";
    return parsed.toString().replace(/\/+$/, "");
  } catch { return FRONTEND_ORIGIN + "/nexus"; }
})();
const COOKIE_NAME = "nexus_github_session";
const STATE_COOKIE = "nexus_oauth_state";
const oauthHandoffs = new Map();
const SESSION_TTL = 8 * 60 * 60;
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_AVATAR_BYTES = 1024 * 1024;
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }, max: 5, connectionTimeoutMillis: 8000 }) : null;
const authPool = (process.env.AUTH_DATABASE_URL || process.env.NEON_DATABASE_URL) ? new Pool({ connectionString: process.env.AUTH_DATABASE_URL || process.env.NEON_DATABASE_URL, ssl: process.env.AUTH_DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }, max: 3, connectionTimeoutMillis: 8000 }) : null;
let schemaReady;

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());

// IP denylist and temporary automatic bans.
// Set NEXUS_BANNED_IPS to a comma-separated list of exact IP addresses in Render.
const manuallyBannedIps = new Set(
  String(process.env.NEXUS_BANNED_IPS || "").split(",").map(value => value.trim()).filter(Boolean)
);
const ipViolations = new Map();
const temporaryIpBans = new Map();
const BAN_WINDOW_MS = 10 * 60 * 1000;
const BAN_THRESHOLD = Math.max(2, Math.min(20, Number(process.env.NEXUS_BAN_THRESHOLD || 5)));
const BAN_DURATION_MS = Math.max(60_000, Math.min(7 * 24 * 60 * 60 * 1000, Number(process.env.NEXUS_BAN_DURATION_MS || 30 * 60 * 1000)));
function clientIp(req) {
  return String(req.ip || req.socket?.remoteAddress || "").replace(/^::ffff:/, "");
}
function recordIpViolation(ip) {
  const now = Date.now();
  const recent = (ipViolations.get(ip) || []).filter(timestamp => now - timestamp < BAN_WINDOW_MS);
  recent.push(now);
  ipViolations.set(ip, recent);
  if (recent.length >= BAN_THRESHOLD) {
    temporaryIpBans.set(ip, now + BAN_DURATION_MS);
    ipViolations.delete(ip);
  }
}
app.use((req, res, next) => {
  const ip = clientIp(req);
  const now = Date.now();
  const banUntil = temporaryIpBans.get(ip) || 0;
  if (manuallyBannedIps.has(ip) || banUntil > now) {
    if (banUntil && banUntil <= now) temporaryIpBans.delete(ip);
    if (banUntil > now) res.setHeader("Retry-After", String(Math.ceil((banUntil - now) / 1000)));
    return res.status(403).json({ error: "Access from this IP address is blocked.", code: "IP_BANNED" });
  }
  next();
});

// Short burst protection only; no restrictive hourly request quota.
// Health checks and CORS preflight requests are excluded.
const rateLimitReply = (req, res) => {
  recordIpViolation(clientIp(req));
  return res.status(429).json({
    error: "Too many requests. Please wait a moment and try again.",
    code: "RATE_LIMITED"
  });
};
const globalLimiter = rateLimit({
  windowMs: 10 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: req => req.path === "/health" || req.method === "OPTIONS",
  handler: rateLimitReply
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: rateLimitReply
});
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: rateLimitReply
});
const emailAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: rateLimitReply
});

app.use(globalLimiter);

// Layer 2: cap concurrent work so slow upstream APIs cannot exhaust the process.
const MAX_IN_FLIGHT = Math.max(20, Math.min(200, Number(process.env.NEXUS_MAX_IN_FLIGHT || 80)));
let inFlightRequests = 0;
app.use((req, res, next) => {
  if (inFlightRequests >= MAX_IN_FLIGHT) {
    res.setHeader("Retry-After", "2");
    return res.status(503).json({
      error: "NEXUS is busy right now. Please retry shortly.",
      code: "SERVER_BUSY"
    });
  }
  inFlightRequests += 1;
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    inFlightRequests = Math.max(0, inFlightRequests - 1);
  };
  res.once("finish", release);
  res.once("close", release);
  next();
});

// Keep the existing avatar upload allowance while rejecting oversized bodies.
app.use(express.json({ limit: "2.5mb" }));

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
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.SESSION_SECRET);
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
  const authorization = String(req.headers.authorization || "");
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const value = bearer || parseCookies(req)[COOKIE_NAME];
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
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && !originAllowed(req)) return res.status(403).json({ error: "Origin not allowed." });
  next();
});

// More restrictive budgets for authentication and API operations.
app.use("/auth", authLimiter);
app.use("/auth/email", emailAuthLimiter);
app.use("/api", apiLimiter);

async function githubRequest(path, token, options = {}) {
  const response = await fetch("https://api.github.com" + path, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    },
    signal: options.signal || AbortSignal.timeout(10000)
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
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).send("Google OAuth is not configured.");
  const state = crypto.randomBytes(24).toString("hex");
  res.setHeader("Set-Cookie", STATE_COOKIE + "=" + encodeURIComponent(state + "." + sign(state)) + "; " + cookieOptions(600));
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", API_BASE_URL + "/auth/google/callback");
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
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || typeof req.query.code !== "string") return res.status(503).send("Google OAuth is not fully configured.");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: req.query.code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: API_BASE_URL + "/auth/google/callback", grant_type: "authorization_code" }) });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.access_token) throw new Error("Google authorization failed.");
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: "Bearer " + tokens.access_token } });
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.email || profile.verified_email !== true) throw new Error("Google did not return a verified email address.");
    const session = seal({ provider: "google", googleId: String(profile.id), email: profile.email, login: profile.name || profile.email, avatarUrl: profile.picture || "", expiresAt: Date.now() + SESSION_TTL * 1000 });
    // Use a short-lived one-time handoff so browser third-party-cookie restrictions
    // do not break the GitHub Pages frontend after Google redirects back here.
    res.append("Set-Cookie", COOKIE_NAME + "=" + encodeURIComponent(session) + "; " + cookieOptions(SESSION_TTL));
    const handoffCode = crypto.randomBytes(32).toString("hex");
    oauthHandoffs.set(handoffCode, { session, expiresAt: Date.now() + 60_000 });
    res.setHeader("Cache-Control", "no-store");
    res.redirect(FRONTEND_URL + "/?google=handoff&code=" + handoffCode);
  } catch (error) { res.status(400).send(error.message || "Google authorization failed."); }
});
function emailConfigReady() { return Boolean(authPool && process.env.RESEND_API_KEY && process.env.EMAIL_FROM); }
async function ensureEmailAuthSchema() {
  if (!authPool) throw Object.assign(new Error("Email sign-in requires NEON_DATABASE_URL or AUTH_DATABASE_URL."), { status: 503 });
  await authPool.query("CREATE TABLE IF NOT EXISTS nexus_email_accounts (email TEXT PRIMARY KEY, password_hash TEXT NOT NULL, verified BOOLEAN NOT NULL DEFAULT FALSE, verification_hash TEXT, verification_expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
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
  if (!emailConfigReady()) throw Object.assign(new Error("Add RESEND_API_KEY, EMAIL_FROM and a working Neon database URL to Render to enable email sign-in."), { status: 503 });
  const verifyUrl = API_BASE_URL + "/auth/email/verify?token=" + encodeURIComponent(token);
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email], subject: "Verify your NEXUS account", html: "<p>Welcome to NEXUS.</p><p><a href=\"" + verifyUrl + "\">Verify your email address</a></p><p>If you did not request this, ignore this message.</p>" }) });
  if (!response.ok) throw Object.assign(new Error("Could not send verification email. Check the Resend configuration."), { status: 502 });
}
app.post("/auth/email/register", async (req, res) => {
  try {
    if (!emailConfigReady()) return res.status(503).json({ error: "Email sign-in is not configured. Add NEON_DATABASE_URL, RESEND_API_KEY and EMAIL_FROM in Render." });
    await ensureEmailAuthSchema();
    const email = normalizeEmail(req.body && req.body.email), password = String(req.body && req.body.password || "");
    if (password.length < 10 || password.length > 200) return res.status(400).json({ error: "Password must contain 10–200 characters." });
    const token = crypto.randomBytes(32).toString("hex"), hash = crypto.createHash("sha256").update(token).digest("hex");
    const saved = await authPool.query("INSERT INTO nexus_email_accounts (email,password_hash,verification_hash,verification_expires_at) VALUES ($1,$2,$3,NOW()+INTERVAL '30 minutes') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,verified=FALSE,verification_hash=EXCLUDED.verification_hash,verification_expires_at=EXCLUDED.verification_expires_at WHERE nexus_email_accounts.verified=FALSE RETURNING email", [email, passwordHash(password), hash]);
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
    const result = await authPool.query("UPDATE nexus_email_accounts SET verified=TRUE,verification_hash=NULL,verification_expires_at=NULL WHERE verification_hash=$1 AND verification_expires_at>NOW() RETURNING email", [hash]);
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
    const result = await authPool.query("SELECT password_hash,verified FROM nexus_email_accounts WHERE email=$1", [email]);
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
  url.searchParams.set("redirect_uri", API_BASE_URL + "/auth/github/callback");
  url.searchParams.set("scope", "read:user repo delete_repo");
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
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code: req.query.code, redirect_uri: API_BASE_URL + "/auth/github/callback" })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) throw new Error(tokenData.error_description || "GitHub authorization failed.");
    const profile = await githubRequest("/user", tokenData.access_token);
    const session = seal({ accessToken: tokenData.access_token, githubId: String(profile.id), login: profile.login, avatarUrl: profile.avatar_url, expiresAt: Date.now() + SESSION_TTL * 1000 });
    res.append("Set-Cookie", COOKIE_NAME + "=" + encodeURIComponent(session) + "; " + cookieOptions(SESSION_TTL));
    const handoffCode = crypto.randomBytes(32).toString("hex");
    oauthHandoffs.set(handoffCode, { session, expiresAt: Date.now() + 60_000 });
    res.redirect(FRONTEND_URL + "/?github=handoff&code=" + handoffCode);
  } catch (error) { res.status(400).send(error.message || "GitHub authorization failed."); }
});
app.post("/auth/exchange", (req, res) => {
  const code = String(req.body && req.body.code || "");
  const handoff = oauthHandoffs.get(code);
  if (!/^[a-f0-9]{64}$/.test(code) || !handoff || handoff.expiresAt < Date.now()) {
    oauthHandoffs.delete(code);
    return res.status(400).json({ error: "GitHub sign-in link expired. Connect again." });
  }
  oauthHandoffs.delete(code);
  res.setHeader("Cache-Control", "no-store");
  res.json({ session: handoff.session, expiresIn: SESSION_TTL });
});
app.post("/auth/logout", (req, res) => {
  clearCookie(res, COOKIE_NAME);
  res.json({ ok: true });
});
app.get("/api/me", (req, res) => { const session = getSession(req); res.json({ connected: Boolean(session), provider: session ? (session.provider || "github") : null, user: session ? { login: session.login, email: session.email || null, avatarUrl: session.avatarUrl || "" } : null }); });
app.get("/api/repos", requireSession, async (req, res) => {
  try {
    const repos = await githubRequest("/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member", req.github.accessToken);
    res.json({ repositories: repos.map(repo => ({ fullName: repo.full_name, name: repo.name, private: repo.private, defaultBranch: repo.default_branch, htmlUrl: repo.html_url, permissions: repo.permissions || {} })) });
  } catch (error) { safeError(res, error); }
});

// GitHub repository lifecycle: create, inspect, update and delete.
app.get("/api/repo", requireSession, async (req, res) => {
  try {
    const repository = req.query.repository;
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    const repo = await githubRequest("/repos/" + repository, req.github.accessToken);
    res.json({ repository: repo.full_name, name: repo.name, description: repo.description || "", homepage: repo.homepage || "", private: repo.private, archived: repo.archived, defaultBranch: repo.default_branch, htmlUrl: repo.html_url, permissions: repo.permissions || {} });
  } catch (error) { safeError(res, error); }
});
app.post("/api/repos", requireSession, async (req, res) => {
  try {
    const body = req.body || {}, name = String(body.name || "").trim();
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(name)) return res.status(400).json({ error: "Repository name must be 1–100 characters and use letters, numbers, dots, underscores or hyphens." });
    if (description.length > 350) return res.status(400).json({ error: "Description must be 350 characters or fewer." });
    const created = await githubRequest("/user/repos", req.github.accessToken, { method: "POST", body: JSON.stringify({ name, description, private: body.private !== false, auto_init: body.autoInit !== false }) });
    res.status(201).json({ ok: true, repository: created.full_name, name: created.name, private: created.private, defaultBranch: created.default_branch, htmlUrl: created.html_url });
  } catch (error) { safeError(res, error); }
});
app.patch("/api/repos", requireSession, async (req, res) => {
  try {
    const body = req.body || {}, repository = body.repository;
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    const current = await githubRequest("/repos/" + repository, req.github.accessToken);
    if (!current.permissions || !current.permissions.admin) return res.status(403).json({ error: "Admin access to this repository is required to change its settings." });
    const patch = {};
    if (typeof body.name === "string" && body.name.trim()) {
      const name = body.name.trim();
      if (!/^[A-Za-z0-9._-]{1,100}$/.test(name)) return res.status(400).json({ error: "Invalid repository name." });
      patch.name = name;
    }
    if (typeof body.description === "string") {
      if (body.description.length > 350) return res.status(400).json({ error: "Description must be 350 characters or fewer." });
      patch.description = body.description;
    }
    if (typeof body.homepage === "string") {
      if (body.homepage && !/^https?:\/\//i.test(body.homepage)) return res.status(400).json({ error: "Homepage must start with http:// or https://." });
      patch.homepage = body.homepage;
    }
    if (typeof body.private === "boolean") patch.private = body.private;
    if (typeof body.archived === "boolean") patch.archived = body.archived;
    if (typeof body.hasIssues === "boolean") patch.has_issues = body.hasIssues;
    if (typeof body.hasWiki === "boolean") patch.has_wiki = body.hasWiki;
    if (!Object.keys(patch).length) return res.status(400).json({ error: "No repository settings were supplied." });
    const updated = await githubRequest("/repos/" + repository, req.github.accessToken, { method: "PATCH", body: JSON.stringify(patch) });
    res.json({ ok: true, repository: updated.full_name, name: updated.name, description: updated.description || "", homepage: updated.homepage || "", private: updated.private, archived: updated.archived, defaultBranch: updated.default_branch, htmlUrl: updated.html_url });
  } catch (error) { safeError(res, error); }
});
app.delete("/api/repos", requireSession, async (req, res) => {
  try {
    const body = req.body || {}, repository = body.repository;
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    if (body.confirmRepository !== repository) return res.status(400).json({ error: "Type the exact repository name to confirm deletion." });
    const current = await githubRequest("/repos/" + repository, req.github.accessToken);
    if (!current.permissions || !current.permissions.admin) return res.status(403).json({ error: "Admin access is required to delete this repository." });
    await githubRequest("/repos/" + repository, req.github.accessToken, { method: "DELETE" });
    res.json({ ok: true, deleted: repository });
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
app.delete("/api/files", requireSession, async (req, res) => {
  try {
    const body = req.body || {}, repository = body.repository, path = body.path, sha = body.sha;
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    if (!validPath(path)) return res.status(400).json({ error: "Invalid file path." });
    if (typeof sha !== "string" || !/^[a-f0-9]{40}$/i.test(sha)) return res.status(400).json({ error: "A valid current file SHA is required to delete." });
    const repo = await githubRequest("/repos/" + repository, req.github.accessToken);
    const branch = typeof body.branch === "string" && body.branch.trim() ? body.branch.trim() : repo.default_branch;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const result = await githubRequest("/repos/" + repository + "/contents/" + encodedPath, req.github.accessToken, {
      method: "DELETE", body: JSON.stringify({ message: body.message || ("Delete " + path), sha, branch })
    });
    res.json({ ok: true, path, branch, commit: result.commit.sha });
  } catch (error) { safeError(res, error); }
});
app.get("/api/commits", requireSession, async (req, res) => {
  try {
    const repository = req.query.repository, path = typeof req.query.path === "string" ? req.query.path : "";
    if (!validRepoName(repository)) return res.status(400).json({ error: "Repository must use owner/name format." });
    if (path && !validPath(path)) return res.status(400).json({ error: "Invalid file path." });
    const repo = await githubRequest("/repos/" + repository, req.github.accessToken);
    const branch = typeof req.query.branch === "string" && req.query.branch.trim() ? req.query.branch.trim() : repo.default_branch;
    const query = new URLSearchParams({ sha: branch, per_page: "20" });
    if (path) query.set("path", path);
    const commits = await githubRequest("/repos/" + repository + "/commits?" + query.toString(), req.github.accessToken);
    res.json({ repository, branch, commits: commits.map(item => ({ sha: item.sha, message: (item.commit && item.commit.message || "").split("\\n")[0], author: item.commit && item.commit.author && item.commit.author.name, date: item.commit && item.commit.author && item.commit.author.date, url: item.html_url })) });
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

const dns = require("node:dns").promises;
const net = require("node:net");
const http = require("node:http");
const https = require("node:https");
let monitorSchemaReady;
async function ensureMonitorSchema() {
  if (!pool) throw Object.assign(new Error("Persistent monitoring requires DATABASE_URL on the Render service."), { status: 503 });
  if (!monitorSchemaReady) monitorSchemaReady = pool.query(
    "CREATE TABLE IF NOT EXISTS nexus_monitors (id BIGSERIAL PRIMARY KEY, owner_github_id TEXT NOT NULL REFERENCES nexus_users(github_id) ON DELETE CASCADE, name VARCHAR(80) NOT NULL, url TEXT NOT NULL, interval_seconds INTEGER NOT NULL DEFAULT 300 CHECK (interval_seconds IN (300,600,900,3600)), keyword TEXT NOT NULL DEFAULT '', enabled BOOLEAN NOT NULL DEFAULT TRUE, last_status TEXT NOT NULL DEFAULT 'pending' CHECK (last_status IN ('pending','up','down')), last_status_code INTEGER, last_latency_ms INTEGER, last_error TEXT NOT NULL DEFAULT '', last_checked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());" +
    "CREATE INDEX IF NOT EXISTS nexus_monitors_owner_idx ON nexus_monitors(owner_github_id,created_at DESC);" +
    "CREATE INDEX IF NOT EXISTS nexus_monitors_due_idx ON nexus_monitors(enabled,last_checked_at);" +
    "CREATE TABLE IF NOT EXISTS nexus_monitor_checks (id BIGSERIAL PRIMARY KEY, monitor_id BIGINT NOT NULL REFERENCES nexus_monitors(id) ON DELETE CASCADE, status TEXT NOT NULL CHECK (status IN ('up','down')), status_code INTEGER, latency_ms INTEGER, error TEXT NOT NULL DEFAULT '', checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW());" +
    "CREATE INDEX IF NOT EXISTS nexus_monitor_checks_history_idx ON nexus_monitor_checks(monitor_id,checked_at DESC);" +
    "CREATE TABLE IF NOT EXISTS nexus_monitor_incidents (id BIGSERIAL PRIMARY KEY, monitor_id BIGINT NOT NULL REFERENCES nexus_monitors(id) ON DELETE CASCADE, reason TEXT NOT NULL DEFAULT '', started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), resolved_at TIMESTAMPTZ);"
  ).catch(error => { monitorSchemaReady = null; throw error; });
  await monitorSchemaReady;
}
function publicMonitorAddress(address) {
  if (net.isIP(address) === 4) {
    const p=address.split(".").map(Number),a=p[0],b=p[1],c=p[2];
    if(a===0||a===10||a===127||a>=224||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&(b===168||(b===0&&c<=2)))||(a===100&&b>=64&&b<=127)||(a===198&&(b===18||b===19||b===51))||(a===203&&b===0&&c===113))return false;
    return true;
  }
  if(net.isIP(address)===6){
    const value=address.toLowerCase();
    if(value.startsWith("::ffff:"))return publicMonitorAddress(value.slice(7));
    if(value.startsWith("2001:db8:")||value.startsWith("2001:10:")||value.startsWith("2002:"))return false;
    const first=parseInt(value.split(":")[0]||"0",16);
    return first>=0x2000&&first<=0x3fff;
  }
  return false;
}
async function validateMonitorUrl(value) {
  let url;
  try { url=new URL(String(value||"").trim()); } catch { throw Object.assign(new Error("Enter a valid website URL."),{status:400}); }
  const host=url.hostname.replace(/^\[|\]$/g,"");
  if(!["http:","https:"].includes(url.protocol)||url.username||url.password||(url.port&&!["80","443"].includes(url.port))||!host||host==="localhost"||host.endsWith(".local")||host.endsWith(".internal"))
    throw Object.assign(new Error("Only public HTTP/HTTPS websites on ports 80 and 443 can be monitored."),{status:400});
  let addresses;
  try { addresses=await dns.lookup(host,{all:true,verbatim:true}); } catch { throw Object.assign(new Error("The website hostname could not be resolved."),{status:400}); }
  if(!addresses.length||addresses.some(item=>!publicMonitorAddress(item.address)))throw Object.assign(new Error("Private, local and reserved network addresses cannot be monitored."),{status:400});
  url.hash="";
  return url.toString();
}
async function limitedResponseText(response,maxBytes=512*1024) {
  if(!response.body)return "";
  const reader=response.body.getReader(),chunks=[];let total=0;
  try { while(total<maxBytes){const part=await reader.read();if(part.done)break;const chunk=part.value.subarray(0,maxBytes-total);chunks.push(Buffer.from(chunk));total+=chunk.byteLength;if(chunk.byteLength<part.value.byteLength)break;} }
  finally { await reader.cancel().catch(()=>{}); }
  return Buffer.concat(chunks).toString("utf8");
}
async function persistMonitorCheck(monitor,result) {
  const client=await pool.connect();
  try {
    await client.query("BEGIN");
    const current=await client.query("SELECT last_status FROM nexus_monitors WHERE id=$1 FOR UPDATE",[monitor.id]);
    if(!current.rows.length){await client.query("ROLLBACK");return;}
    const previous=current.rows[0].last_status;
    await client.query("INSERT INTO nexus_monitor_checks (monitor_id,status,status_code,latency_ms,error) VALUES ($1,$2,$3,$4,$5)",[monitor.id,result.status,result.statusCode,result.latencyMs,result.error]);
    await client.query("UPDATE nexus_monitors SET last_status=$2,last_status_code=$3,last_latency_ms=$4,last_error=$5,last_checked_at=NOW(),updated_at=NOW() WHERE id=$1",[monitor.id,result.status,result.statusCode,result.latencyMs,result.error]);
    if(result.status==="down"&&previous!=="down")await client.query("INSERT INTO nexus_monitor_incidents (monitor_id,reason) VALUES ($1,$2)",[monitor.id,result.error||("HTTP "+result.statusCode)]);
    else if(result.status==="up"&&previous==="down")await client.query("UPDATE nexus_monitor_incidents SET resolved_at=NOW() WHERE monitor_id=$1 AND resolved_at IS NULL",[monitor.id]);
    await client.query("COMMIT");
  } catch(error){await client.query("ROLLBACK").catch(()=>{});throw error;}
  finally{client.release();}
}
async function requestMonitorTarget(target,checkKeyword) {
  const url=new URL(target),host=url.hostname.replace(/^\[|\]$/g,"");
  const addresses=await dns.lookup(host,{all:true,verbatim:true});
  if(!addresses.length||addresses.some(item=>!publicMonitorAddress(item.address)))throw new Error("The website resolved to a private or reserved address.");
  const transport=url.protocol==="https:"?https:http;
  return await new Promise((resolve,reject)=>{
    let body="",total=0,settled=false;
    const req=transport.request(url,{method:"GET",headers:{"User-Agent":"NEXUS-Monitor/1.0","Accept":"text/html,application/json,text/plain,*/*"},lookup:(_hostname,options,callback)=>{
      const candidates=addresses.filter(item=>!options.family||item.family===options.family);
      const selected=candidates[0]||addresses[0];
      if(options.all)callback(null,candidates.length?candidates:addresses);
      else callback(null,selected.address,selected.family);
    }},response=>{
      response.on("data",chunk=>{
        if(checkKeyword&&total<512*1024){const part=chunk.subarray(0,512*1024-total);body+=part.toString("utf8");}
        total+=chunk.length;
      });
      response.on("end",()=>{if(!settled){settled=true;resolve({statusCode:response.statusCode||0,body});}});
      response.on("error",error=>{if(!settled){settled=true;reject(error);}});
    });
    req.setTimeout(10000,()=>req.destroy(Object.assign(new Error("Request timed out after 10 seconds."),{name:"TimeoutError"})));
    req.on("error",error=>{if(!settled){settled=true;reject(error);}});
    req.end();
  });
}
async function runMonitorCheck(monitor) {
  const started=Date.now();let result={status:"down",statusCode:null,latencyMs:0,error:""};
  try {
    const target=await validateMonitorUrl(monitor.url);
    const response=await requestMonitorTarget(target,Boolean(monitor.keyword));
    result.statusCode=response.statusCode;
    if(monitor.keyword&&response.statusCode>=200&&response.statusCode<400&&!response.body.toLowerCase().includes(String(monitor.keyword).toLowerCase()))result.error="Expected keyword was not found.";
    result.latencyMs=Date.now()-started;result.status=response.statusCode>=200&&response.statusCode<400&&!result.error?"up":"down";
    if(result.status==="down"&&!result.error)result.error="HTTP "+response.statusCode;
  } catch(error){result.latencyMs=Date.now()-started;result.error=error.name==="TimeoutError"||error.name==="AbortError"?"Request timed out after 10 seconds.":String(error.message||"Request failed").slice(0,240);}
  await persistMonitorCheck(monitor,result);
  return result;
}
async function runDueMonitorChecks() {
  if(!pool)return {checked:0};
  await ensureMonitorSchema();
  const client=await pool.connect();let due=[];
  try {
    await client.query("BEGIN");
    const selected=await client.query("SELECT * FROM nexus_monitors WHERE enabled=TRUE AND (last_checked_at IS NULL OR last_checked_at<=NOW()-make_interval(secs=>interval_seconds)) ORDER BY last_checked_at NULLS FIRST LIMIT 10 FOR UPDATE SKIP LOCKED");
    due=selected.rows;
    for(const item of due)await client.query("UPDATE nexus_monitors SET last_checked_at=NOW() WHERE id=$1",[item.id]);
    await client.query("COMMIT");
  } catch(error){await client.query("ROLLBACK").catch(()=>{});throw error;}
  finally{client.release();}
  const outcomes=await Promise.all(due.map(item=>runMonitorCheck(item).catch(error=>{console.error("[NEXUS monitor check]",item.id,error.message);return null;})));
  return {checked:outcomes.filter(Boolean).length};
}
app.get("/api/monitors",requireSocialUser,async(req,res)=>{
  try {
    await ensureMonitorSchema();
    const result=await pool.query("SELECT m.id,m.name,m.url,m.interval_seconds,m.keyword,m.enabled,m.last_status,m.last_status_code,m.last_latency_ms,m.last_error,m.last_checked_at,m.created_at,COALESCE(s.uptime_pct,100)::numeric(5,2) AS uptime_24h,COALESCE(s.checks_count,0)::int AS checks_24h,COALESCE(i.open_count,0)::int AS open_incidents FROM nexus_monitors m LEFT JOIN LATERAL (SELECT ROUND(100.0*COUNT(*) FILTER(WHERE status='up')/NULLIF(COUNT(*),0),2) AS uptime_pct,COUNT(*) AS checks_count FROM nexus_monitor_checks c WHERE c.monitor_id=m.id AND c.checked_at>NOW()-INTERVAL '24 hours') s ON TRUE LEFT JOIN LATERAL (SELECT COUNT(*) AS open_count FROM nexus_monitor_incidents x WHERE x.monitor_id=m.id AND x.resolved_at IS NULL) i ON TRUE WHERE m.owner_github_id=$1 ORDER BY m.created_at DESC",[req.nexusUser.github_id]);
    res.json({monitors:result.rows});
  } catch(error){res.status(error.status||500).json({error:error.message||"Could not load monitors."});}
});
app.post("/api/monitors",requireSocialUser,async(req,res)=>{
  try {
    await ensureMonitorSchema();
    const body=req.body||{},name=String(body.name||"").trim(),keyword=String(body.keyword||"").trim();
    if(!name||name.length>80)return res.status(400).json({error:"Monitor name must contain 1–80 characters."});
    if(keyword.length>100)return res.status(400).json({error:"Keyword must be 100 characters or fewer."});
    const interval=Number(body.intervalSeconds||300);
    if(![300,600,900,3600].includes(interval))return res.status(400).json({error:"Choose a check interval of 5, 10, 15 or 60 minutes."});
    const url=await validateMonitorUrl(body.url);
    const saved=await pool.query("INSERT INTO nexus_monitors (owner_github_id,name,url,interval_seconds,keyword) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,url,interval_seconds,keyword,enabled,last_status,last_checked_at",[req.nexusUser.github_id,name,url,interval,keyword]);
    res.status(201).json({ok:true,monitor:saved.rows[0]});
  } catch(error){res.status(error.status||500).json({error:error.message||"Could not create monitor."});}
});
app.patch("/api/monitors/:id",requireSocialUser,async(req,res)=>{
  try {
    await ensureMonitorSchema();
    if(!/^\d+$/.test(req.params.id))return res.status(400).json({error:"Invalid monitor ID."});
    const body=req.body||{},fields=[],values=[req.params.id,req.nexusUser.github_id];
    if(typeof body.enabled==="boolean"){values.push(body.enabled);fields.push("enabled=$"+values.length);}
    if(typeof body.name==="string"){const name=body.name.trim();if(!name||name.length>80)return res.status(400).json({error:"Monitor name must contain 1–80 characters."});values.push(name);fields.push("name=$"+values.length);}
    if(body.intervalSeconds!==undefined){const interval=Number(body.intervalSeconds);if(![300,600,900,3600].includes(interval))return res.status(400).json({error:"Invalid check interval."});values.push(interval);fields.push("interval_seconds=$"+values.length);}
    if(typeof body.keyword==="string"){if(body.keyword.length>100)return res.status(400).json({error:"Keyword must be 100 characters or fewer."});values.push(body.keyword.trim());fields.push("keyword=$"+values.length);}
    if(!fields.length)return res.status(400).json({error:"No monitor settings supplied."});
    const result=await pool.query("UPDATE nexus_monitors SET "+fields.join(",")+",updated_at=NOW() WHERE id=$1 AND owner_github_id=$2 RETURNING id,enabled,name,interval_seconds,keyword",values);
    if(!result.rows.length)return res.status(404).json({error:"Monitor not found."});
    res.json({ok:true,monitor:result.rows[0]});
  } catch(error){res.status(error.status||500).json({error:error.message||"Could not update monitor."});}
});
app.delete("/api/monitors/:id",requireSocialUser,async(req,res)=>{
  try {
    await ensureMonitorSchema();
    if(!/^\d+$/.test(req.params.id))return res.status(400).json({error:"Invalid monitor ID."});
    const result=await pool.query("DELETE FROM nexus_monitors WHERE id=$1 AND owner_github_id=$2 RETURNING id",[req.params.id,req.nexusUser.github_id]);
    if(!result.rows.length)return res.status(404).json({error:"Monitor not found."});
    res.json({ok:true,deleted:result.rows[0].id});
  } catch(error){res.status(error.status||500).json({error:error.message||"Could not delete monitor."});}
});
app.post("/api/monitors/:id/check",requireSocialUser,async(req,res)=>{
  try {
    await ensureMonitorSchema();
    if(!/^\d+$/.test(req.params.id))return res.status(400).json({error:"Invalid monitor ID."});
    const found=await pool.query("SELECT * FROM nexus_monitors WHERE id=$1 AND owner_github_id=$2",[req.params.id,req.nexusUser.github_id]);
    if(!found.rows.length)return res.status(404).json({error:"Monitor not found."});
    const result=await runMonitorCheck(found.rows[0]);res.json({ok:true,result});
  } catch(error){res.status(error.status||500).json({error:error.message||"Monitor check failed."});}
});
app.get("/api/monitors/:id/history",requireSocialUser,async(req,res)=>{
  try {
    await ensureMonitorSchema();
    if(!/^\d+$/.test(req.params.id))return res.status(400).json({error:"Invalid monitor ID."});
    const owned=await pool.query("SELECT id FROM nexus_monitors WHERE id=$1 AND owner_github_id=$2",[req.params.id,req.nexusUser.github_id]);
    if(!owned.rows.length)return res.status(404).json({error:"Monitor not found."});
    const [checks,incidents]=await Promise.all([
      pool.query("SELECT status,status_code,latency_ms,error,checked_at FROM nexus_monitor_checks WHERE monitor_id=$1 ORDER BY checked_at DESC LIMIT 50",[req.params.id]),
      pool.query("SELECT reason,started_at,resolved_at FROM nexus_monitor_incidents WHERE monitor_id=$1 ORDER BY started_at DESC LIMIT 20",[req.params.id])
    ]);
    res.json({checks:checks.rows,incidents:incidents.rows});
  } catch(error){res.status(error.status||500).json({error:error.message||"Could not load monitor history."});}
});
app.post("/api/monitor/cron",async(req,res)=>{
  const secret=String(process.env.MONITOR_CRON_SECRET||"");
  if(!secret)return res.status(503).json({error:"Monitor cron secret is not configured."});
  if(!safeEqual(req.headers["x-monitor-secret"],secret))return res.status(403).json({error:"Forbidden."});
  try{res.json({ok:true,...await runDueMonitorChecks()});}
  catch(error){res.status(500).json({error:"Scheduled monitor checks failed."});}
});

app.post("/api/network/inspect",async(req,res)=>{
  try {
    const target=await validateMonitorUrl((req.body||{}).url);
    const url=new URL(target),host=url.hostname.replace(/^\\[|\\]$/g,"");
    const records=await dns.lookup(host,{all:true,verbatim:true});
    const started=Date.now();
    const response=await requestMonitorTarget(target,false);
    res.json({
      ok:true,
      target,
      host,
      addresses:[...new Set(records.map(item=>item.address))],
      protocol:url.protocol.replace(":","").toUpperCase(),
      statusCode:response.statusCode,
      latencyMs:Date.now()-started,
      reachable:response.statusCode>=200&&response.statusCode<500,
      checkedAt:new Date().toISOString()
    });
  } catch(error) {
    res.status(error.status||400).json({error:String(error.message||"Network inspection failed.").slice(0,240)});
  }
});


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


const DRIVE_BUCKET = "nexus-drive";
const SUPABASE_URL = String(process.env.SUPABASE_URL || "https://lpxtfybphywzocywdynu.supabase.co").replace(/\/+$/, "");
function driveConfigured() { return Boolean(process.env.SUPABASE_SECRET_KEY); }
function storageOwnerKey(session) {
  if (session.githubId) return "github:" + String(session.githubId);
  if (session.googleId) return "google:" + String(session.googleId);
  if (session.email) return "email:" + crypto.createHash("sha256").update(String(session.email).trim().toLowerCase()).digest("hex");
  throw Object.assign(new Error("This account does not have a supported storage identity. Sign in again."), { status: 401 });
}
function requireStorageUser(req, res, next) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Sign in to NEXUS to use cloud storage.", code: "AUTH_REQUIRED" });
  try { req.storageSession = session; req.storageOwner = storageOwnerKey(session); next(); }
  catch (error) { res.status(error.status || 401).json({ error: error.message }); }
}
function driveRequireConfig(req, res, next) {
  if (!driveConfigured()) return res.status(503).json({ error: "Cloud Storage is not configured yet. Add SUPABASE_SECRET_KEY to the Render environment.", code: "STORAGE_NOT_CONFIGURED" });
  next();
}
function driveHeaders(extra = {}) {
  const key = process.env.SUPABASE_SECRET_KEY || "";
  return { apikey: key, Authorization: "Bearer " + key, ...extra };
}
async function driveRest(path, options = {}) {
  if (!driveConfigured()) throw Object.assign(new Error("Cloud Storage is not configured on the server."), { status: 503 });
  const response = await fetch(SUPABASE_URL + path, {
    ...options,
    headers: driveHeaders({ ...(options.body && !(options.body instanceof Buffer) ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) }),
    signal: options.signal || AbortSignal.timeout(20000)
  });
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const message = data && (data.message || data.error || data.msg) || "Cloud storage request failed (" + response.status + ").";
    throw Object.assign(new Error(String(message).slice(0, 220)), { status: response.status >= 400 && response.status < 500 ? response.status : 502 });
  }
  return data;
}
function drivePath(path) { return String(path).split("/").map(encodeURIComponent).join("/"); }
function driveName(value) {
  const name = String(value || "").trim();
  if (!name || name.length > 255 || /[\/\\\u0000-\u001f]/.test(name) || name === "." || name === "..")
    throw Object.assign(new Error("File name must be 1–255 characters and cannot contain slashes."), { status: 400 });
  return name;
}
function driveQuery(values) {
  const params = new URLSearchParams(values);
  return "?" + params.toString();
}
async function driveGetOwned(owner, id) {
  const rows = await driveRest("/rest/v1/nexus_drive_files" + driveQuery({
    select: "*", id: "eq." + id, owner_key: "eq." + owner, limit: "1"
  }));
  return Array.isArray(rows) ? rows[0] || null : null;
}
async function driveParent(owner, parentId) {
  if (!parentId) return null;
  if (typeof parentId !== "string" || !/^[0-9a-f-]{36}$/i.test(parentId))
    throw Object.assign(new Error("Invalid destination folder."), { status: 400 });
  const folder = await driveGetOwned(owner, parentId);
  if (!folder || !folder.is_folder || folder.trashed_at) throw Object.assign(new Error("Destination folder was not found."), { status: 404 });
  return folder;
}
async function driveInsert(row) {
  const rows = await driveRest("/rest/v1/nexus_drive_files", {
    method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row)
  });
  return Array.isArray(rows) ? rows[0] : rows;
}
async function drivePatch(owner, id, patch) {
  const rows = await driveRest("/rest/v1/nexus_drive_files" + driveQuery({
    id: "eq." + id, owner_key: "eq." + owner, select: "*"
  }), { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }) });
  return Array.isArray(rows) ? rows[0] || null : null;
}
async function driveDeleteObject(path) {
  if (!path) return;
  await driveRest("/storage/v1/object/" + DRIVE_BUCKET, {
    method: "DELETE", body: JSON.stringify({ prefixes: [path] })
  });
}
async function driveDeleteTree(owner, id, depth = 0) {
  if (depth > 40) throw Object.assign(new Error("Folder nesting is too deep to delete safely."), { status: 400 });
  const item = await driveGetOwned(owner, id);
  if (!item) return false;
  if (item.is_folder) {
    const children = await driveRest("/rest/v1/nexus_drive_files" + driveQuery({
      select: "id", owner_key: "eq." + owner, parent_id: "eq." + id, limit: "1000"
    }));
    for (const child of (children || [])) await driveDeleteTree(owner, child.id, depth + 1);
  } else if (item.object_path) {
    await driveDeleteObject(item.object_path);
  }
  await driveRest("/rest/v1/nexus_drive_files" + driveQuery({ id: "eq." + id, owner_key: "eq." + owner }), { method: "DELETE" });
  return true;
}
async function driveSignedUrl(path, expiresIn = 180) {
  const result = await driveRest("/storage/v1/object/sign/" + DRIVE_BUCKET + "/" + drivePath(path), {
    method: "POST", body: JSON.stringify({ expiresIn })
  });
  const signed = result && (result.signedURL || result.signedUrl);
  if (!signed) throw new Error("Could not create a secure file link.");
  return signed.startsWith("http") ? signed : SUPABASE_URL + signed;
}
app.get("/api/storage/status", requireStorageUser, (req, res) => {
  res.json({ configured: driveConfigured(), provider: "Supabase Storage", bucket: DRIVE_BUCKET, maxFileBytes: 50 * 1024 * 1024 });
});
app.get("/api/storage/files", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const owner = req.storageOwner, view = String(req.query.view || "files"), parent = String(req.query.parent || "");
    const values = { select: "*", owner_key: "eq." + owner, order: "is_folder.desc,name.asc", limit: "1000" };
    if (view === "trash") values.trashed_at = "not.is.null";
    else {
      values.trashed_at = "is.null";
      if (view === "starred") values.is_starred = "eq.true";
      else if (parent) { await driveParent(owner, parent); values.parent_id = "eq." + parent; }
      else values.parent_id = "is.null";
    }
    const files = await driveRest("/rest/v1/nexus_drive_files" + driveQuery(values));
    const usage = await driveRest("/rest/v1/nexus_drive_files" + driveQuery({
      select: "size_bytes", owner_key: "eq." + owner, is_folder: "eq.false", trashed_at: "is.null", limit: "1000"
    }));
    const usedBytes = (usage || []).reduce((sum, item) => sum + Number(item.size_bytes || 0), 0);
    res.json({ files: files || [], usedBytes, fileCount: (usage || []).length, maxFileBytes: 50 * 1024 * 1024 });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not list cloud files." }); }
});
app.get("/api/storage/search", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 100);
    if (!q) return res.json({ files: [] });
    const files = await driveRest("/rest/v1/nexus_drive_files" + driveQuery({
      select: "*", owner_key: "eq." + req.storageOwner, trashed_at: "is.null",
      name: "ilike.*" + q.replace(/[\\*%_,()]/g, " ") + "*", order: "updated_at.desc", limit: "100"
    }));
    res.json({ files: files || [] });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Search failed." }); }
});
app.get("/api/storage/folders", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const folders = await driveRest("/rest/v1/nexus_drive_files" + driveQuery({
      select: "id,name,parent_id", owner_key: "eq." + req.storageOwner,
      is_folder: "eq.true", trashed_at: "is.null", order: "name.asc", limit: "1000"
    }));
    res.json({ folders: folders || [] });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not list folders." }); }
});
app.post("/api/storage/folders", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const name = driveName((req.body || {}).name), parentId = (req.body || {}).parentId || null;
    await driveParent(req.storageOwner, parentId);
    const folder = await driveInsert({ owner_key: req.storageOwner, parent_id: parentId, name, is_folder: true });
    res.status(201).json({ ok: true, file: folder });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not create folder." }); }
});
app.post("/api/storage/upload", requireStorageUser, driveRequireConfig, express.raw({ type: "application/octet-stream", limit: "50mb" }), async (req, res) => {
  let objectPath = "";
  try {
    if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: "Choose a non-empty file to upload." });
    if (req.body.length > 50 * 1024 * 1024) return res.status(413).json({ error: "Files are limited to 50 MB each." });
    let name = "";
    try { name = decodeURIComponent(String(req.headers["x-file-name"] || "")); } catch { name = ""; }
    name = driveName(name);
    const parentId = String(req.headers["x-parent-id"] || "") || null;
    await driveParent(req.storageOwner, parentId);
    const mime = String(req.headers["x-file-type"] || "application/octet-stream").slice(0, 150);
    const id = crypto.randomUUID();
    const ownerFolder = crypto.createHash("sha256").update(req.storageOwner).digest("hex").slice(0, 28);
    objectPath = ownerFolder + "/" + id + "/" + name;
    await driveRest("/storage/v1/object/" + DRIVE_BUCKET + "/" + drivePath(objectPath), {
      method: "POST", headers: { "Content-Type": mime, "x-upsert": "false", "cache-control": "3600" }, body: req.body
    });
    const file = await driveInsert({
      id, owner_key: req.storageOwner, parent_id: parentId, name, object_path: objectPath,
      mime_type: mime, size_bytes: req.body.length, is_folder: false
    });
    res.status(201).json({ ok: true, file });
  } catch (error) {
    if (objectPath) await driveDeleteObject(objectPath).catch(() => {});
    res.status(error.status || 500).json({ error: error.message || "Upload failed." });
  }
});
app.get("/api/storage/files/:id/download", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const file = await driveGetOwned(req.storageOwner, req.params.id);
    if (!file || file.is_folder || file.trashed_at) return res.status(404).json({ error: "File not found." });
    res.json({ url: await driveSignedUrl(file.object_path, 180), downloadUrl: (await driveSignedUrl(file.object_path, 180)) + "?download=" + encodeURIComponent(file.name), name: file.name, mimeType: file.mime_type });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not prepare download." }); }
});
app.patch("/api/storage/files/:id", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const file = await driveGetOwned(req.storageOwner, req.params.id);
    if (!file) return res.status(404).json({ error: "File not found." });
    const body = req.body || {}, patch = {};
    if (body.name !== undefined) patch.name = driveName(body.name);
    if (typeof body.is_starred === "boolean") patch.is_starred = body.is_starred;
    if (body.parentId !== undefined) {
      await driveParent(req.storageOwner, body.parentId || null);
      if (file.is_folder && body.parentId === file.id) return res.status(400).json({ error: "A folder cannot be moved into itself." });
      if (file.is_folder && body.parentId) {
        let cursor = await driveGetOwned(req.storageOwner, body.parentId), depth = 0;
        while (cursor && depth++ < 40) {
          if (cursor.id === file.id) return res.status(400).json({ error: "A folder cannot be moved inside one of its own subfolders." });
          cursor = cursor.parent_id ? await driveGetOwned(req.storageOwner, cursor.parent_id) : null;
        }
      }
      patch.parent_id = body.parentId || null;
    }
    if (!Object.keys(patch).length) return res.status(400).json({ error: "No changes supplied." });
    const saved = await drivePatch(req.storageOwner, req.params.id, patch);
    if (!saved) return res.status(404).json({ error: "File not found." });
    res.json({ ok: true, file: saved });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not update file." }); }
});
app.post("/api/storage/files/:id/trash", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const file = await driveGetOwned(req.storageOwner, req.params.id);
    if (!file) return res.status(404).json({ error: "File not found." });
    const saved = await drivePatch(req.storageOwner, req.params.id, { trashed_at: new Date().toISOString() });
    res.json({ ok: true, file: saved });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not move item to trash." }); }
});
app.post("/api/storage/files/:id/restore", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const file = await driveGetOwned(req.storageOwner, req.params.id);
    if (!file || !file.trashed_at) return res.status(404).json({ error: "Trashed item not found." });
    const saved = await drivePatch(req.storageOwner, req.params.id, { trashed_at: null });
    res.json({ ok: true, file: saved });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not restore item." }); }
});
app.delete("/api/storage/files/:id", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const deleted = await driveDeleteTree(req.storageOwner, req.params.id);
    if (!deleted) return res.status(404).json({ error: "File not found." });
    res.json({ ok: true, deleted: req.params.id });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not permanently delete item." }); }
});
app.post("/api/storage/files/:id/share", requireStorageUser, driveRequireConfig, async (req, res) => {
  try {
    const file = await driveGetOwned(req.storageOwner, req.params.id);
    if (!file || file.is_folder || file.trashed_at) return res.status(404).json({ error: "File not found." });
    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresDays = Number((req.body || {}).expiresDays || 7);
    const expiresAt = expiresDays === 0 ? null : new Date(Date.now() + Math.max(1, Math.min(365, expiresDays)) * 86400000).toISOString();
    await driveRest("/rest/v1/nexus_drive_shares", {
      method: "POST", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ file_id: file.id, owner_key: req.storageOwner, token_hash: tokenHash, permission: "view", expires_at: expiresAt })
    });
    res.status(201).json({ ok: true, url: API_BASE_URL + "/api/storage/share/" + token, expiresAt });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || "Could not create share link." }); }
});
app.get("/api/storage/share/:token", driveRequireConfig, async (req, res) => {
  try {
    const token = String(req.params.token || "");
    if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return res.status(404).send("Share link not found.");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const rows = await driveRest("/rest/v1/nexus_drive_shares" + driveQuery({
      select: "file_id,owner_key,expires_at", token_hash: "eq." + tokenHash, limit: "1"
    }));
    const share = Array.isArray(rows) ? rows[0] : null;
    if (!share || (share.expires_at && new Date(share.expires_at).getTime() <= Date.now())) return res.status(404).send("This share link has expired or is unavailable.");
    const file = await driveGetOwned(share.owner_key, share.file_id);
    if (!file || file.is_folder || file.trashed_at) return res.status(404).send("This file is no longer shared.");
    const url = await driveSignedUrl(file.object_path, 120);
    res.setHeader("Cache-Control", "no-store");
    res.redirect(302, url);
  } catch (error) { res.status(error.status || 500).send("Could not open this shared file."); }
});

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
  // Initialize the social tables before monitor tables, which reference nexus_users.
  if (pool) {
    await ensureSchema();
    await ensureMonitorSchema();
    console.log("[NEXUS database] social and monitor schemas ready");
  }
  const monitorTimer = setInterval(() => runDueMonitorChecks().catch(error => console.error("[NEXUS monitor scheduler]", error.message)), 30_000);
  monitorTimer.unref();
  const server = app.listen(PORT, "0.0.0.0", () => console.log("NEXUS GitHub API listening on " + PORT));
  server.requestTimeout = 120000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  server.on("error", error => console.error("[NEXUS server]", error.message));
}
startServer();
