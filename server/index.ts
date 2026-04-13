/**
 * API server — connects to Neon via DATABASE_URL (never expose this to the browser).
 */
import { randomUUID } from "node:crypto";
import { randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import pg from "pg";
import {
  analyticsAllowedForTier,
  billingPlansPayload,
  countUserPortfolios,
  createCheckoutSession,
  evaluatePublishGate,
  getBillingMode,
  getManualPaymentInfo,
  getUserTier,
  handleStripeWebhook,
  maxPortfoliosForTier,
  normalizeTier,
  sanitizeUpsertForTier,
  showPoweredByForTier,
} from "./billing.js";
import { capturePayPalOrder } from "./paypal.js";

const { Pool } = pg;

function requireEnv(name: string, hint: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    console.error(`Missing ${name} in .env — ${hint}`);
    process.exit(1);
  }
  return value;
}

const PORT = Number(process.env.PORT || process.env.API_PORT) || 3001;
const DATABASE_URL = requireEnv("DATABASE_URL", "add your Neon connection string.");
const JWT_SECRET = requireEnv("JWT_SECRET", "set a long random string for signing login cookies.");
const NODE_ENV = process.env.NODE_ENV ?? "development";
const isProd = NODE_ENV === "production";

function parseClientOrigins(): string[] {
  const raw = process.env.CLIENT_ORIGIN ?? "http://localhost:8080";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Same site with or without leading `www.` (e.g. apex ↔ www). */
function sameSiteOrigin(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    if (ua.protocol !== ub.protocol) return false;
    const ha = ua.hostname.toLowerCase();
    const hb = ub.hostname.toLowerCase();
    if (ha === hb) return true;
    const strip = (h: string) => (h.startsWith("www.") ? h.slice(4) : h);
    return strip(ha) === strip(hb);
  } catch {
    return false;
  }
}

/** Allow explicit CLIENT_ORIGIN list plus typical dev URLs (LAN IP, alternate ports). */
function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  const allowed = parseClientOrigins();
  if (allowed.includes(origin)) return true;
  if (isProd) {
    return allowed.some((a) => sameSiteOrigin(a, origin));
  }
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(u.hostname)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(u.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

const app = express();
if (isProd) {
  const hops = Number(process.env.TRUST_PROXY_HOPS);
  app.set("trust proxy", Number.isFinite(hops) && hops > 0 ? hops : 1);
}

app.post(
  "/billing/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    handleStripeWebhook(req, res, pool).catch(next);
  },
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, origin ?? true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

const jsonBodyLimit = process.env.JSON_BODY_LIMIT?.trim() || (isProd ? "2mb" : "25mb");
app.use(express.json({ limit: jsonBodyLimit }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 25 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ message: "Too many attempts. Try again later." });
  },
});

const analyticsWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProd ? 120 : 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ message: "Too many analytics events. Slow down." });
  },
});

const COOKIE = "auth_token";
const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function ensureBillingSchema(): Promise<void> {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS billing_tier text NOT NULL DEFAULT 'free'
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS company text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_url text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE portfolios
    ADD COLUMN IF NOT EXISTS profile_image_url text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE portfolios
    ADD COLUMN IF NOT EXISTS cv_url text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE portfolios
    ADD COLUMN IF NOT EXISTS cv_file_name text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE portfolios
    ADD COLUMN IF NOT EXISTS custom_domain_verify_token text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE portfolios
    ADD COLUMN IF NOT EXISTS custom_domain_last_checked_at timestamptz
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_portfolios_custom_domain
    ON portfolios(custom_domain)
  `);
  await ensurePortfolioAnalyticsFkOnUpdateCascade();
}

/** Slug renames update portfolios.slug; analytics rows must follow or PostgreSQL raises FK errors (500 / process crash). */
async function ensurePortfolioAnalyticsFkOnUpdateCascade(): Promise<void> {
  const { rows } = await pool.query<{ conname: string; def: string }>(
    `SELECT c.conname, pg_get_constraintdef(c.oid) AS def
     FROM pg_constraint c
     INNER JOIN pg_class rel ON rel.oid = c.conrelid
     INNER JOIN pg_class ref ON ref.oid = c.confrelid
     WHERE rel.relname = 'portfolio_analytics'
       AND ref.relname = 'portfolios'
       AND c.contype = 'f'`,
  );
  if (rows.length === 0) return;
  const fk = rows.find((r) => r.def.includes("portfolio_slug")) ?? rows[0];
  if (fk.def.toLowerCase().includes("on update cascade")) return;

  const q = (name: string) => `"${name.replace(/"/g, '""')}"`;
  await pool.query(`ALTER TABLE portfolio_analytics DROP CONSTRAINT ${q(fk.conname)}`);
  await pool.query(`
    ALTER TABLE portfolio_analytics
      ADD CONSTRAINT portfolio_analytics_portfolio_slug_fkey
      FOREIGN KEY (portfolio_slug) REFERENCES portfolios (slug) ON DELETE CASCADE ON UPDATE CASCADE
  `);
  console.log("Migrated portfolio_analytics FK: added ON UPDATE CASCADE for portfolio_slug.");
}

type JwtPayload = { userId: string; email: string };

function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function optionalAuthUserId(req: express.Request): string | null {
  const token = req.cookies[COOKIE] as string | undefined;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies[COOKIE] as string | undefined;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    (req as express.Request & { userId?: string }).userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid session" });
  }
}

type DbPortfolio = {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  profile_image_url: string;
  cv_url: string;
  cv_file_name: string;
  headline: string;
  bio: string;
  email: string;
  location: string;
  theme: string;
  custom_domain: string;
  custom_domain_verified: boolean;
  custom_domain_verify_token: string;
  custom_domain_last_checked_at: Date | null;
  social_links?: unknown;
  projects: unknown;
  created_at: Date;
};

function rowToClient(row: DbPortfolio) {
  const social =
    row.social_links && typeof row.social_links === "object" && !Array.isArray(row.social_links)
      ? row.social_links
      : {};
  return {
    id: row.id,
    user_id: row.user_id,
    slug: row.slug,
    fullName: row.full_name,
    profileImageUrl: row.profile_image_url ?? "",
    cvUrl: row.cv_url ?? "",
    cvFileName: row.cv_file_name ?? "",
    headline: row.headline,
    bio: row.bio,
    email: row.email,
    location: row.location,
    theme: row.theme,
    customDomain: row.custom_domain,
    customDomainVerified: row.custom_domain_verified,
    customDomainVerifyToken: row.custom_domain_verify_token ?? "",
    customDomainLastCheckedAt: row.custom_domain_last_checked_at?.toISOString() ?? "",
    socialLinks: social as Record<string, string>,
    projects: row.projects,
    createdAt: row.created_at.toISOString(),
  };
}

/** Public slug response: never expose user_id; include isOwner + branding flag from owner tier. */
function rowToPublicPayload(row: DbPortfolio, isOwner: boolean, ownerBillingTier?: string) {
  const full = rowToClient(row);
  const { user_id: _uid, customDomainVerifyToken: _t, customDomainLastCheckedAt: _lc, ...rest } = full;
  const tier = normalizeTier(ownerBillingTier);
  return { ...rest, isOwner, showPoweredBy: showPoweredByForTier(tier) };
}

function normalizeDomainInput(raw: string | undefined): string {
  if (!raw) return "";
  let d = raw.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.+$/, "");
  return d;
}

function generateDomainVerifyToken(): string {
  return `pf-${randomBytes(10).toString("hex")}`;
}

app.post("/auth/signup", authLimiter, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email?.trim() || !password || password.length < 6) {
    res.status(400).json({ message: "Valid email and password (6+ chars) required" });
    return;
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query<{ id: string; email: string }>(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`,
      [email.trim().toLowerCase(), hash],
    );
    const user = rows[0];
    const token = signToken({ userId: user.id, email: user.email });
    res.cookie(COOKIE, token, cookieOpts);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: "",
        company: "",
        avatarUrl: "",
        billingTier: "free",
      },
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23505") {
      res.status(409).json({ message: "Email already registered" });
      return;
    }
    console.error(e);
    res.status(500).json({ message: "Sign up failed" });
  }
});

app.post("/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email?.trim() || !password) {
    res.status(400).json({ message: "Email and password required" });
    return;
  }
  try {
    const { rows } = await pool.query<{
      id: string;
      email: string;
      password_hash: string;
      billing_tier: string;
      full_name: string;
      company: string;
      avatar_url: string;
    }>(`SELECT id, email, password_hash, billing_tier, full_name, company, avatar_url FROM users WHERE email = $1`, [
      email.trim().toLowerCase(),
    ]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = signToken({ userId: user.id, email: user.email });
    res.cookie(COOKIE, token, cookieOpts);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name ?? "",
        company: user.company ?? "",
        avatarUrl: user.avatar_url ?? "",
        billingTier: normalizeTier(user.billing_tier),
      },
    });
  } catch (e) {
    console.error("auth/login", e);
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE, { ...cookieOpts, maxAge: 0 });
  res.json({ ok: true });
});

app.get("/auth/me", async (req, res) => {
  const token = req.cookies[COOKIE] as string | undefined;
  if (!token) {
    res.status(401).json({ message: "Not logged in" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    const { rows } = await pool.query<{
      id: string;
      email: string;
      billing_tier: string;
      full_name: string;
      company: string;
      avatar_url: string;
    }>(
      `SELECT id, email, billing_tier, full_name, company, avatar_url FROM users WHERE id = $1`,
      [decoded.userId],
    );
    const row = rows[0];
    if (!row) {
      res.status(401).json({ message: "Invalid session" });
      return;
    }
    res.json({
      id: row.id,
      email: row.email,
      fullName: row.full_name ?? "",
      company: row.company ?? "",
      avatarUrl: row.avatar_url ?? "",
      billingTier: normalizeTier(row.billing_tier),
    });
  } catch {
    res.status(401).json({ message: "Invalid session" });
  }
});

app.patch("/auth/profile", authMiddleware, async (req, res) => {
  const userId = (req as express.Request & { userId: string }).userId;
  const { fullName, company, avatarUrl } = req.body as {
    fullName?: string;
    company?: string;
    avatarUrl?: string;
  };
  const safeFullName = (fullName ?? "").trim().slice(0, 120);
  const safeCompany = (company ?? "").trim().slice(0, 120);
  const safeAvatarUrl = (avatarUrl ?? "").trim();
  if (safeAvatarUrl.length > 1_500_000) {
    res.status(400).json({ message: "Avatar image is too large" });
    return;
  }
  const { rows } = await pool.query<{
    id: string;
    email: string;
    billing_tier: string;
    full_name: string;
    company: string;
    avatar_url: string;
  }>(
    `UPDATE users
     SET full_name = $2, company = $3, avatar_url = $4
     WHERE id = $1
     RETURNING id, email, billing_tier, full_name, company, avatar_url`,
    [userId, safeFullName, safeCompany, safeAvatarUrl],
  );
  const row = rows[0];
  res.json({
    user: {
      id: row.id,
      email: row.email,
      fullName: row.full_name ?? "",
      company: row.company ?? "",
      avatarUrl: row.avatar_url ?? "",
      billingTier: normalizeTier(row.billing_tier),
    },
  });
});

app.get("/billing/plans", (_req, res) => {
  res.json(billingPlansPayload());
});

app.get("/billing/manual", authMiddleware, (req, res) => {
  const userId = (req as express.Request & { userId: string }).userId;
  res.json(getManualPaymentInfo(userId));
});

app.post("/billing/paypal/capture", authMiddleware, async (req, res) => {
  const userId = (req as express.Request & { userId: string }).userId;
  const orderId = (req.body as { orderId?: string }).orderId?.trim();
  if (!orderId) {
    res.status(400).json({ message: "orderId required" });
    return;
  }
  const result = await capturePayPalOrder(pool, userId, orderId);
  if ("error" in result) {
    res.status(result.status).json({ message: result.error });
    return;
  }
  res.json({ ok: true, billingTier: result.tier });
});

app.get("/billing/status", authMiddleware, async (req, res) => {
  const userId = (req as express.Request & { userId: string }).userId;
  const tier = await getUserTier(pool, userId);
  const count = await countUserPortfolios(pool, userId);
  const mode = getBillingMode();
  res.json({
    billingTier: tier,
    billingMode: mode,
    portfolioCount: count,
    limits: {
      maxPortfolios: mode === "strict" && tier === "free" ? 0 : maxPortfoliosForTier(tier),
      themes:
        tier === "free"
          ? ["glass"]
          : ["glass", "minimal", "bold", "vintage", "vintageRefined", "vintageEditorial", "devMode", "scrollStory", "atrium"],
      customDomain: tier === "premium",
      analytics: tier === "basic" || tier === "premium",
      showPoweredBy: tier === "free",
    },
  });
});

app.post("/billing/checkout", authMiddleware, async (req, res) => {
  const userId = (req as express.Request & { userId: string }).userId;
  const product = (req.body as { product?: string }).product;
  if (product !== "basic" && product !== "premium") {
    res.status(400).json({ message: "product must be basic or premium" });
    return;
  }
  const { rows } = await pool.query<{ email: string }>(`SELECT email FROM users WHERE id = $1`, [userId]);
  const email = rows[0]?.email;
  if (!email) {
    res.status(400).json({ message: "User not found" });
    return;
  }
  const result = await createCheckoutSession(pool, userId, email, product);
  if ("error" in result) {
    res.status(result.status).json({ message: result.error });
    return;
  }
  res.json({ url: result.url });
});

app.post("/billing/dev-set-tier", authMiddleware, async (req, res) => {
  if (isProd || process.env.BILLING_DEV_BYPASS !== "true") {
    res.status(404).end();
    return;
  }
  const userId = (req as express.Request & { userId: string }).userId;
  const tier = (req.body as { tier?: string }).tier;
  if (tier !== "free" && tier !== "basic" && tier !== "premium") {
    res.status(400).json({ message: "tier must be free, basic, or premium" });
    return;
  }
  await pool.query(`UPDATE users SET billing_tier = $2 WHERE id = $1`, [userId, tier]);
  res.json({ ok: true, billingTier: tier });
});

app.get("/portfolios", authMiddleware, async (req, res) => {
  const userId = (req as express.Request & { userId: string }).userId;
  const { rows } = await pool.query<DbPortfolio>(
    `SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  res.json(rows.map(rowToClient));
});

app.get("/portfolios/:slug", async (req, res) => {
  const slug = req.params.slug;
  const { rows } = await pool.query<DbPortfolio & { owner_billing_tier?: string }>(
    `SELECT p.*, u.billing_tier AS owner_billing_tier
     FROM portfolios p INNER JOIN users u ON u.id = p.user_id WHERE p.slug = $1`,
    [slug],
  );
  const row = rows[0];
  if (!row) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  const viewerId = optionalAuthUserId(req);
  const isOwner = Boolean(viewerId && viewerId === row.user_id);
  const ownerTier = row.owner_billing_tier;
  const { owner_billing_tier: _o, ...portfolioRow } = row;
  res.json(rowToPublicPayload(portfolioRow as DbPortfolio, isOwner, ownerTier));
});

app.get("/portfolios/by-domain", async (req, res) => {
  const host = normalizeDomainInput(String(req.query.host ?? ""));
  if (!host) {
    res.status(400).json({ message: "host query required" });
    return;
  }
  const { rows } = await pool.query<DbPortfolio & { owner_billing_tier?: string }>(
    `SELECT p.*, u.billing_tier AS owner_billing_tier
     FROM portfolios p INNER JOIN users u ON u.id = p.user_id
     WHERE p.custom_domain = $1 AND p.custom_domain_verified = true`,
    [host],
  );
  const row = rows[0];
  if (!row) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  const viewerId = optionalAuthUserId(req);
  const isOwner = Boolean(viewerId && viewerId === row.user_id);
  const ownerTier = row.owner_billing_tier;
  const { owner_billing_tier: _o, ...portfolioRow } = row;
  res.json(rowToPublicPayload(portfolioRow as DbPortfolio, isOwner, ownerTier));
});

app.post("/domains/verify", authMiddleware, async (req, res) => {
  const userId = (req as express.Request & { userId: string }).userId;
  const slug = (req.body as { slug?: string }).slug?.trim();
  if (!slug) {
    res.status(400).json({ message: "slug required" });
    return;
  }
  const tier = await getUserTier(pool, userId);
  if (tier !== "premium") {
    res.status(402).json({ message: "Custom domains require Premium." });
    return;
  }
  const { rows } = await pool.query<DbPortfolio>(
    `SELECT * FROM portfolios WHERE slug = $1 AND user_id = $2`,
    [slug, userId],
  );
  const row = rows[0];
  if (!row) {
    res.status(404).json({ message: "Portfolio not found" });
    return;
  }
  const domain = normalizeDomainInput(row.custom_domain);
  const token = (row.custom_domain_verify_token ?? "").trim();
  if (!domain || !token) {
    res.status(400).json({ message: "Set a custom domain first." });
    return;
  }
  const txtHost = `_pf-verify.${domain}`;
  let verified = false;
  try {
    const records = await resolveTxt(txtHost);
    const flat = records.flat().join(" ");
    verified = flat.includes(token);
  } catch {
    verified = false;
  }
  await pool.query(
    `UPDATE portfolios SET custom_domain_verified = $3, custom_domain_last_checked_at = now()
     WHERE id = $1 AND user_id = $2`,
    [row.id, userId, verified],
  );
  if (!verified) {
    res.status(409).json({
      verified: false,
      message: `TXT record not found. Add ${txtHost} with value ${token} and retry.`,
    });
    return;
  }
  res.json({ verified: true, message: "Domain verified." });
});

app.post("/portfolios/upsert", authMiddleware, async (req, res, next) => {
  try {
  const userId = (req as express.Request & { userId: string }).userId;
  const body = req.body as {
    id?: string;
    slug?: string;
    fullName?: string;
    profileImageUrl?: string;
    cvUrl?: string;
    cvFileName?: string;
    headline?: string;
    bio?: string;
    email?: string;
    location?: string;
    theme?: string;
    customDomain?: string;
    socialLinks?: Record<string, string>;
    projects?: unknown;
  };

  if (!body.slug?.trim() || !body.fullName?.trim() || !body.headline?.trim()) {
    res.status(400).json({ message: "slug, fullName, headline required" });
    return;
  }

  const slugTrim = body.slug.trim();
  const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

  let rowById: DbPortfolio | undefined;
  if (body.id && isUuid(body.id)) {
    const r = await pool.query<DbPortfolio>(`SELECT * FROM portfolios WHERE id = $1 AND user_id = $2`, [
      body.id,
      userId,
    ]);
    rowById = r.rows[0];
  }

  const slugOwner = await pool.query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM portfolios WHERE slug = $1`,
    [slugTrim],
  );
  const slugRow = slugOwner.rows[0];
  if (slugRow && slugRow.user_id !== userId) {
    res.status(403).json({ message: "This slug is taken" });
    return;
  }
  if (slugRow && rowById && slugRow.id !== rowById.id) {
    res.status(403).json({ message: "This slug is taken" });
    return;
  }

  /** Same slug as an existing row but client omitted id — treat as update. */
  if (!rowById && slugRow && slugRow.user_id === userId) {
    const r = await pool.query<DbPortfolio>(`SELECT * FROM portfolios WHERE id = $1 AND user_id = $2`, [
      slugRow.id,
      userId,
    ]);
    rowById = r.rows[0];
  }

  const tier = await getUserTier(pool, userId);
  const portfolioCount = await countUserPortfolios(pool, userId);
  const isNewPortfolio = !rowById;
  const gate = evaluatePublishGate({
    mode: getBillingMode(),
    tier,
    isNewPortfolio,
    portfolioCount,
  });
  if (!gate.ok) {
    res.status(gate.status).json({ code: gate.code, message: gate.message });
    return;
  }

  const { theme: safeTheme, customDomain: newDomain } = sanitizeUpsertForTier(
    tier,
    body.theme,
    normalizeDomainInput(body.customDomain),
  );

  /** Never trust the client for verification — only DNS/admin flows may set true in DB. */
  let customDomainVerified = false;
  let customDomainVerifyToken = "";
  if (rowById) {
    const prevDomain = (rowById.custom_domain ?? "").trim();
    customDomainVerified = newDomain === prevDomain ? rowById.custom_domain_verified : false;
    customDomainVerifyToken =
      newDomain && newDomain === prevDomain
        ? rowById.custom_domain_verify_token
        : newDomain
          ? generateDomainVerifyToken()
          : "";
  } else if (newDomain) {
    customDomainVerifyToken = generateDomainVerifyToken();
  }

  const insertId = body.id && isUuid(body.id) ? body.id : randomUUID();
  const projectsJson = JSON.stringify(body.projects ?? []);
  const socialJson = JSON.stringify(body.socialLinks ?? {});

  if (rowById) {
    await pool.query(
      `UPDATE portfolios SET
        slug = $1,
        full_name = $2, profile_image_url = $3, cv_url = $4, cv_file_name = $5, headline = $6, bio = $7, email = $8, location = $9,
        theme = $10, custom_domain = $11, custom_domain_verified = $12, custom_domain_verify_token = $13,
        social_links = $14::jsonb, projects = $15::jsonb,
        updated_at = now()
      WHERE id = $16 AND user_id = $17`,
      [
        slugTrim,
        body.fullName,
        body.profileImageUrl ?? "",
        body.cvUrl ?? "",
        body.cvFileName ?? "",
        body.headline,
        body.bio ?? "",
        body.email ?? "",
        body.location ?? "",
        safeTheme,
        newDomain,
        customDomainVerified,
        customDomainVerifyToken,
        socialJson,
        projectsJson,
        rowById.id,
        userId,
      ],
    );
  } else {
    await pool.query(
      `INSERT INTO portfolios (
        id, user_id, slug, full_name, profile_image_url, cv_url, cv_file_name, headline, bio, email, location, theme,
        custom_domain, custom_domain_verified, custom_domain_verify_token, social_links, projects
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17::jsonb)`,
      [
        insertId,
        userId,
        slugTrim,
        body.fullName,
        body.profileImageUrl ?? "",
        body.cvUrl ?? "",
        body.cvFileName ?? "",
        body.headline,
        body.bio ?? "",
        body.email ?? "",
        body.location ?? "",
        safeTheme,
        newDomain,
        false,
        customDomainVerifyToken,
        socialJson,
        projectsJson,
      ],
    );
  }

  res.json({ ok: true });
  } catch (err) {
    console.error("POST /portfolios/upsert failed:", err);
    next(err);
  }
});

app.delete("/portfolios/:id", authMiddleware, async (req, res) => {
  const userId = (req as express.Request & { userId: string }).userId;
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: "id required" });
    return;
  }
  const { rowCount } = await pool.query(`DELETE FROM portfolios WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (!rowCount) {
    res.status(404).json({ message: "Portfolio not found" });
    return;
  }
  res.json({ ok: true });
});

app.post("/analytics/view", analyticsWriteLimiter, async (req, res) => {
  const { slug } = req.body as { slug?: string };
  if (!slug || slug === "demo") {
    res.json({ ok: true });
    return;
  }
  const exists = await pool.query(`SELECT 1 FROM portfolios WHERE slug = $1`, [slug]);
  if (exists.rowCount === 0) {
    res.status(404).json({ message: "Unknown portfolio" });
    return;
  }
  await pool.query(
    `INSERT INTO portfolio_analytics (portfolio_slug, event_type) VALUES ($1, 'view')`,
    [slug],
  );
  res.json({ ok: true });
});

app.post("/analytics/project-click", analyticsWriteLimiter, async (req, res) => {
  const { slug } = req.body as { slug?: string };
  if (!slug || slug === "demo") {
    res.json({ ok: true });
    return;
  }
  const exists = await pool.query(`SELECT 1 FROM portfolios WHERE slug = $1`, [slug]);
  if (exists.rowCount === 0) {
    res.status(404).json({ message: "Unknown portfolio" });
    return;
  }
  await pool.query(
    `INSERT INTO portfolio_analytics (portfolio_slug, event_type) VALUES ($1, 'project_click')`,
    [slug],
  );
  res.json({ ok: true });
});

app.get("/analytics/:slug", authMiddleware, async (req, res) => {
  const slug = req.params.slug;
  const userId = (req as express.Request & { userId: string }).userId;

  if (slug === "demo") {
    res.json({
      slug,
      views: 0,
      projectClicks: 0,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const owned = await pool.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM portfolios WHERE slug = $1 AND user_id = $2`,
    [slug, userId],
  );
  if (Number(owned.rows[0]?.n ?? 0) < 1) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const tier = await getUserTier(pool, userId);
  if (!analyticsAllowedForTier(tier)) {
    res.status(402).json({
      code: "ANALYTICS_LOCKED",
      message: "Analytics are included with Basic and Premium.",
    });
    return;
  }

  const { rows } = await pool.query<{ event_type: string; c: string }>(
    `SELECT event_type, COUNT(*)::text AS c
     FROM portfolio_analytics
     WHERE portfolio_slug = $1
     GROUP BY event_type`,
    [slug],
  );
  let views = 0;
  let projectClicks = 0;
  for (const r of rows) {
    const n = Number(r.c);
    if (r.event_type === "view") views = n;
    if (r.event_type === "project_click") projectClicks = n;
  }
  const updated = await pool.query<{ m: Date | null }>(
    `SELECT MAX(created_at) AS m FROM portfolio_analytics WHERE portfolio_slug = $1`,
    [slug],
  );
  res.json({
    slug,
    views,
    projectClicks,
    updatedAt: (updated.rows[0]?.m ?? new Date()).toISOString(),
  });
});

app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (res.headersSent) {
    next(err);
    return;
  }
  const pg = err as { code?: string; detail?: string; message?: string };
  const hint =
    !isProd && pg?.code
      ? `${pg.message ?? "Database error"}${pg.detail ? ` (${pg.detail})` : ""}`
      : undefined;
  res.status(500).json({ message: "Server error", ...(hint ? { detail: hint } : {}) });
});

async function startServer() {
  try {
    await ensureBillingSchema();
    app.listen(PORT, () => {
      console.log(`API on port ${PORT} (${isProd ? "production" : "development"})`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

void startServer();
