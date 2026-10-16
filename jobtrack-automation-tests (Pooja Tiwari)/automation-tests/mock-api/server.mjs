// Lightweight in-memory stand-in for the JobTrack ASP.NET Core API.
// Mirrors routes, validation rules, status workflow and error shapes from
// backend/src so the automation suite can be exercised without .NET/Postgres.
// It is a test aid only — always run the final suite against the real backend.
import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.MOCK_API_PORT ?? 5100);
const KEY = "mock-signing-key-that-is-long-enough-123";
const db = { users: [], apps: [], history: [], followUps: [], interviews: [] };

const uuid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();
const todayUtc = () => new Date().toISOString().slice(0, 10);
const b64url = (s) => Buffer.from(s).toString("base64url");

function signJwt(user) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const iat = Math.floor(Date.now() / 1000);
  const payload = b64url(JSON.stringify({ sub: user.id, email: user.email, jti: uuid(), iat, nbf: iat, exp: iat + 900, iss: "JobTrack.Api", aud: "JobTrack.Client" }));
  const sig = crypto.createHmac("sha256", KEY).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}
function verifyJwt(token) {
  const [h, p, s] = (token ?? "").split(".");
  if (!h || !p || !s) return null;
  const expected = crypto.createHmac("sha256", KEY).update(`${h}.${p}`).digest("base64url");
  if (expected !== s) return null;
  const payload = JSON.parse(Buffer.from(p, "base64url").toString());
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}

class HttpError extends Error { constructor(status, body) { super(); this.status = status; this.body = body; } }
const fail = (status, code, message) => new HttpError(status, { isSuccess: false, isFailure: true, error: { code, message } });
const validation = (m) => fail(400, "Request.Validation", m);
const notFound = (m) => fail(404, "Resource.NotFound", m);
const unauthorized = (m) => fail(401, "Authentication.Unauthorized", m);
// ASP.NET [ApiController] model-validation response (ProblemDetails)
const modelInvalid = (field, msg) => new HttpError(400, { type: "https://tools.ietf.org/html/rfc9110#section-15.5.1", title: "One or more validation errors occurred.", status: 400, errors: { [field]: [msg] } });

const isEmailAttr = (v) => typeof v === "string" && /^[^@]+@[^@]+$/.test(v); // matches .NET [EmailAddress]
// .NET [Url]: null is valid; any string (including "" or "   ") must start with http://, https:// or ftp://
const isUrlAttr = (v) => v == null || (typeof v === "string" && /^(https?|ftp):\/\//i.test(v));
const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn", "Archived"];
const ALLOWED = { Applied: ["Interview", "Rejected", "Withdrawn"], Interview: ["Offer", "Rejected", "Withdrawn"], Offer: ["Withdrawn", "Archived"], Rejected: ["Archived"], Withdrawn: ["Archived"], Archived: [] };

function required(value, max, name) {
  const v = (value ?? "").toString().trim();
  if (!v) throw validation(`${name} is required.`);
  if (v.length > max) throw validation(`${name} cannot exceed ${max} characters.`);
  return v;
}
const optional = (v) => (v == null || `${v}`.trim() === "" ? null : `${v}`.trim());

function validatePassword(p) {
  if (!p) throw validation("Password is required.");
  if (p.length < 8) throw validation("Password must be at least 8 characters long.");
  if (p.length > 128) throw validation("Password cannot exceed 128 characters.");
  if (!/\p{Lu}/u.test(p)) throw validation("Password must contain at least one uppercase letter.");
  if (!/\p{Ll}/u.test(p)) throw validation("Password must contain at least one lowercase letter.");
  if (!/\p{Nd}/u.test(p)) throw validation("Password must contain at least one number.");
  if (!/[\p{P}\p{S}]/u.test(p)) throw validation("Password must contain at least one special character.");
}

function issueTokens(user) {
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  user.refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  user.refreshTokenExpires = Date.now() + 180 * 864e5;
  return { accessToken: signJwt(user), accessTokenExpiresAtUtc: new Date(Date.now() + 9e5).toISOString(), refreshToken, refreshTokenExpiresAtUtc: new Date(user.refreshTokenExpires).toISOString() };
}

const appResponse = (a) => ({ id: a.id, companyName: a.companyName, roleTitle: a.roleTitle, platform: a.platform, applicationDate: a.applicationDate, currentStatus: a.currentStatus, jobLink: a.jobLink, portfolioLink: a.portfolioLink, gitHubLink: a.gitHubLink, createdAtUtc: a.createdAtUtc, updatedAtUtc: a.updatedAtUtc });
const followUpResponse = (f) => ({ id: f.id, jobApplicationId: f.jobApplicationId, title: f.title, dueDate: f.dueDate, notes: f.notes, isCompleted: f.isCompleted, completedAtUtc: f.completedAtUtc, isOverdue: !f.isCompleted && f.dueDate < todayUtc(), createdAtUtc: f.createdAtUtc, updatedAtUtc: f.updatedAtUtc });
const interviewResponse = (i) => { const { userId, ...rest } = i; return rest; };

function ownedApp(id, userId) {
  const a = db.apps.find((x) => x.id === id && x.userId === userId);
  if (!a) throw notFound("Job application was not found.");
  return a;
}
function changeStatus(a, newStatus) {
  db.history.push({ id: uuid(), jobApplicationId: a.id, oldStatus: a.currentStatus, newStatus, createdAtUtc: nowIso() });
  a.currentStatus = newStatus; a.updatedAtUtc = nowIso();
}

const routes = [];
const route = (method, pattern, auth, handler) => routes.push({ method, re: new RegExp(`^${pattern.replace(/:(\w+)/g, "(?<$1>[0-9a-fA-F-]{36})")}$`), auth, handler });

// ---- Auth ----
route("POST", "/api/auth/register", false, ({ body }) => {
  const email = (body.email ?? "").trim();
  if (!email) throw modelInvalid("Email", "The Email field is required.");
  if (!isEmailAttr(email)) throw modelInvalid("Email", "The Email field is not a valid e-mail address.");
  if (!body.password) throw modelInvalid("Password", "The Password field is required.");
  if (body.password.length < 8 || body.password.length > 128) throw modelInvalid("Password", "The field Password must be a string with a minimum length of 8 and a maximum length of 128.");
  validatePassword(body.password);
  if (db.users.some((u) => u.email.toUpperCase() === email.toUpperCase())) throw validation("The email address is already registered.");
  const user = { id: uuid(), email, password: body.password };
  db.users.push(user);
  return [201, { userId: user.id, email: user.email, tokens: issueTokens(user) }];
});
route("POST", "/api/auth/login", false, ({ body }) => {
  const email = (body.email ?? "").trim();
  if (!email) throw modelInvalid("Email", "The Email field is required.");
  if (!isEmailAttr(email)) throw modelInvalid("Email", "The Email field is not a valid e-mail address.");
  if (!body.password) throw modelInvalid("Password", "The Password field is required.");
  const user = db.users.find((u) => u.email.toUpperCase() === email.toUpperCase());
  if (!user || user.password !== body.password) throw unauthorized("Invalid email or password.");
  return [200, { userId: user.id, email: user.email, tokens: issueTokens(user) }];
});
route("POST", "/api/auth/refresh", false, ({ body }) => {
  if (!body.refreshToken) throw unauthorized("The refresh token is required.");
  const hash = crypto.createHash("sha256").update(body.refreshToken).digest("hex");
  const user = db.users.find((u) => u.refreshTokenHash === hash && u.refreshTokenExpires > Date.now());
  if (!user) throw unauthorized("The refresh token is invalid or expired.");
  return [200, { tokens: issueTokens(user) }];
});
const logout = ({ user }) => { user.refreshTokenHash = null; return [204, null]; };
route("POST", "/api/auth/logout", true, logout);
route("POST", "/api/auth/revoke", true, logout);

// ---- Job applications ----
route("POST", "/api/job-applications", true, ({ user, body }) => {
  for (const f of ["jobLink", "portfolioLink", "gitHubLink"]) if (!isUrlAttr(body[f])) throw modelInvalid(f, `The ${f} field is not a valid fully-qualified http, https, or ftp URL.`);
  const now = nowIso();
  const a = { id: uuid(), userId: user.id, companyName: required(body.companyName, 150, "Company name"), roleTitle: required(body.roleTitle, 150, "Role title"), platform: required(body.platform, 50, "Platform"), applicationDate: todayUtc(), currentStatus: "Applied", jobLink: optional(body.jobLink), portfolioLink: optional(body.portfolioLink), gitHubLink: optional(body.gitHubLink), createdAtUtc: now, updatedAtUtc: null };
  db.apps.push(a);
  return [201, appResponse(a)];
});
route("GET", "/api/job-applications", true, ({ user, query }) => {
  const pageNumber = Number(query.get("pageNumber") ?? 1), pageSize = Number(query.get("pageSize") ?? 20);
  if (pageNumber < 1) throw validation("Page number must be at least 1.");
  if (pageSize < 1 || pageSize > 100) throw validation("Page size must be between 1 and 100.");
  const from = query.get("fromDate"), to = query.get("toDate"), status = query.get("status");
  if (from && to && from > to) throw validation("From date cannot be later than to date.");
  if (status && !STATUSES.includes(status)) throw modelInvalid("status", `The value '${status}' is not valid.`);
  const search = optional(query.get("search"))?.toLowerCase(), platform = optional(query.get("platform"))?.toLowerCase();
  let items = db.apps.filter((a) => a.userId === user.id)
    .filter((a) => (status ? a.currentStatus === status : a.currentStatus !== "Archived"))
    .filter((a) => !search || a.companyName.toLowerCase().includes(search) || a.roleTitle.toLowerCase().includes(search))
    .filter((a) => !platform || a.platform.toLowerCase() === platform)
    .filter((a) => (!from || a.applicationDate >= from) && (!to || a.applicationDate <= to))
    .sort((x, y) => (y.applicationDate.localeCompare(x.applicationDate) || y.createdAtUtc.localeCompare(x.createdAtUtc)));
  const totalCount = items.length, totalPages = Math.ceil(totalCount / pageSize);
  items = items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map(appResponse);
  return [200, { items, pageNumber, pageSize, totalCount, totalPages, hasPreviousPage: pageNumber > 1, hasNextPage: pageNumber < totalPages }];
});
route("GET", "/api/job-applications/:id", true, ({ user, params }) => [200, { ...appResponse(ownedApp(params.id, user.id)), resume: null, coverLetter: null }]);
route("PUT", "/api/job-applications/:id", true, ({ user, params, body }) => {
  for (const f of ["jobLink", "portfolioLink", "gitHubLink"]) if (!isUrlAttr(body[f])) throw modelInvalid(f, `The ${f} field is not a valid fully-qualified http, https, or ftp URL.`);
  const a = ownedApp(params.id, user.id); let changed = false;
  if (body.companyName != null) { a.companyName = required(body.companyName, 150, "Company name"); changed = true; }
  if (body.roleTitle != null) { a.roleTitle = required(body.roleTitle, 150, "Role title"); changed = true; }
  if (body.platform != null) { a.platform = required(body.platform, 50, "Platform"); changed = true; }
  if (body.applicationDate != null) { a.applicationDate = body.applicationDate; changed = true; }
  for (const f of ["jobLink", "portfolioLink", "gitHubLink"]) if (body[f] != null) { a[f] = optional(body[f]); changed = true; }
  if (changed) a.updatedAtUtc = nowIso();
  return [200, appResponse(a)];
});
route("PATCH", "/api/job-applications/:id/status", true, ({ user, params, body }) => {
  const next = body.newStatus;
  if (next == null) throw modelInvalid("NewStatus", "The NewStatus field is required.");
  if (!STATUSES.includes(next)) throw modelInvalid("$.newStatus", "The JSON value could not be converted.");
  const a = ownedApp(params.id, user.id), cur = a.currentStatus;
  if (cur === next) throw validation(`The application is already in ${cur} status.`);
  if (cur === "Archived") throw validation("An archived application can only be restored using the unarchive action.");
  if (body.skipToOffer) { if (!(cur === "Applied" && next === "Offer")) throw validation("The skip-to-offer override is only valid for an Applied to Offer transition."); }
  else if (cur === "Applied" && next === "Offer") throw validation("Applied to Offer requires the explicit skip-to-offer override.");
  else if (!ALLOWED[cur].includes(next)) throw validation(`A status transition from ${cur} to ${next} is not allowed.`);
  changeStatus(a, next);
  return [200, appResponse(a)];
});
route("POST", "/api/job-applications/:id/unarchive", true, ({ user, params }) => {
  const a = ownedApp(params.id, user.id);
  if (a.currentStatus !== "Archived") throw validation("Only an archived application can be unarchived.");
  const entry = db.history.filter((h) => h.jobApplicationId === a.id && h.newStatus === "Archived").at(-1);
  changeStatus(a, entry.oldStatus);
  return [200, appResponse(a)];
});

// ---- Follow-ups ----
const ownedFollowUp = (appId, id, userId) => { ownedApp(appId, userId); const f = db.followUps.find((x) => x.id === id && x.jobApplicationId === appId); if (!f) throw notFound("Follow-up was not found."); return f; };
const dueDate = (d) => { if (!d) throw validation("Follow-up due date is required."); if (d < todayUtc()) throw validation("Follow-up due date cannot be in the past."); return d; };
route("POST", "/api/job-applications/:appId/follow-ups", true, ({ user, params, body }) => {
  ownedApp(params.appId, user.id);
  if (body.dueDate == null) throw modelInvalid("DueDate", "The DueDate field is required.");
  const f = { id: uuid(), jobApplicationId: params.appId, title: required(body.title, 150, "Title"), dueDate: dueDate(body.dueDate), notes: optional(body.notes), isCompleted: false, completedAtUtc: null, createdAtUtc: nowIso(), updatedAtUtc: null };
  db.followUps.push(f);
  return [201, followUpResponse(f)];
});
route("GET", "/api/job-applications/:appId/follow-ups", true, ({ user, params }) => { ownedApp(params.appId, user.id); return [200, db.followUps.filter((f) => f.jobApplicationId === params.appId).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(followUpResponse)]; });
route("GET", "/api/job-applications/:appId/follow-ups/:id", true, ({ user, params }) => [200, followUpResponse(ownedFollowUp(params.appId, params.id, user.id))]);
route("PATCH", "/api/job-applications/:appId/follow-ups/:id", true, ({ user, params, body }) => {
  const f = ownedFollowUp(params.appId, params.id, user.id); let c = false;
  if (body.title != null) { f.title = required(body.title, 150, "Title"); c = true; }
  if (body.dueDate != null) { f.dueDate = dueDate(body.dueDate); c = true; }
  if (body.notes != null) { f.notes = optional(body.notes); c = true; }
  if (c) f.updatedAtUtc = nowIso();
  return [200, followUpResponse(f)];
});
route("PATCH", "/api/job-applications/:appId/follow-ups/:id/completion", true, ({ user, params, body }) => {
  if (body.isCompleted == null) throw validation("Completion state is required.");
  const f = ownedFollowUp(params.appId, params.id, user.id);
  if (f.isCompleted !== body.isCompleted) { f.isCompleted = body.isCompleted; f.completedAtUtc = body.isCompleted ? nowIso() : null; f.updatedAtUtc = nowIso(); }
  return [200, followUpResponse(f)];
});
route("DELETE", "/api/job-applications/:appId/follow-ups/:id", true, ({ user, params }) => { const f = ownedFollowUp(params.appId, params.id, user.id); db.followUps.splice(db.followUps.indexOf(f), 1); return [204, null]; });
route("GET", "/api/follow-ups/pending", true, ({ user }) => [200, db.followUps.filter((f) => !f.isCompleted && db.apps.some((a) => a.id === f.jobApplicationId && a.userId === user.id)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((f) => { const a = db.apps.find((x) => x.id === f.jobApplicationId); const r = followUpResponse(f); delete r.isCompleted; delete r.completedAtUtc; return { ...r, companyName: a.companyName, roleTitle: a.roleTitle }; })]);

// ---- Interviews ----
const ownedInterview = (appId, id, userId) => { ownedApp(appId, userId); const i = db.interviews.find((x) => x.id === id && x.jobApplicationId === appId); if (!i) throw notFound("Interview was not found."); return i; };
route("POST", "/api/job-applications/:appId/interviews", true, ({ user, params, body }) => {
  ownedApp(params.appId, user.id);
  if (!body.scheduledAtUtc) throw modelInvalid("ScheduledAtUtc", "The ScheduledAtUtc field is required.");
  if (body.contactEmail && !isEmailAttr(body.contactEmail)) throw modelInvalid("ContactEmail", "The ContactEmail field is not a valid e-mail address.");
  if (!isUrlAttr(body.meetingLink)) throw modelInvalid("MeetingLink", "The MeetingLink field is not a valid fully-qualified http, https, or ftp URL.");
  const i = { id: uuid(), jobApplicationId: params.appId, title: required(body.title, 150, "Title"), interviewType: required(body.interviewType, 100, "Interview type"), scheduledAtUtc: new Date(body.scheduledAtUtc).toISOString(), location: optional(body.location), meetingLink: optional(body.meetingLink), contactName: optional(body.contactName), contactEmail: optional(body.contactEmail), contactPhone: optional(body.contactPhone), notes: optional(body.notes), createdAtUtc: nowIso(), updatedAtUtc: null };
  db.interviews.push(i);
  return [201, interviewResponse(i)];
});
route("GET", "/api/job-applications/:appId/interviews", true, ({ user, params }) => { ownedApp(params.appId, user.id); return [200, db.interviews.filter((i) => i.jobApplicationId === params.appId).map(interviewResponse)]; });
route("GET", "/api/job-applications/:appId/interviews/:id", true, ({ user, params }) => [200, interviewResponse(ownedInterview(params.appId, params.id, user.id))]);
route("PATCH", "/api/job-applications/:appId/interviews/:id", true, ({ user, params, body }) => {
  const i = ownedInterview(params.appId, params.id, user.id);
  if (body.title != null) i.title = required(body.title, 150, "Title");
  if (body.interviewType != null) i.interviewType = required(body.interviewType, 100, "Interview type");
  if (body.scheduledAtUtc != null) i.scheduledAtUtc = new Date(body.scheduledAtUtc).toISOString();
  for (const f of ["location", "meetingLink", "contactName", "contactEmail", "contactPhone", "notes"]) if (body[f] != null) i[f] = optional(body[f]);
  i.updatedAtUtc = nowIso();
  return [200, interviewResponse(i)];
});
route("DELETE", "/api/job-applications/:appId/interviews/:id", true, ({ user, params }) => { const i = ownedInterview(params.appId, params.id, user.id); db.interviews.splice(db.interviews.indexOf(i), 1); return [204, null]; });
function upcoming(userId, days) {
  const from = Date.now(), to = from + days * 864e5;
  return db.interviews.filter((i) => { const t = Date.parse(i.scheduledAtUtc); return t >= from && t <= to && db.apps.some((a) => a.id === i.jobApplicationId && a.userId === userId); })
    .sort((a, b) => a.scheduledAtUtc.localeCompare(b.scheduledAtUtc))
    .map((i) => { const a = db.apps.find((x) => x.id === i.jobApplicationId); const { createdAtUtc, updatedAtUtc, ...r } = interviewResponse(i); return { ...r, companyName: a.companyName, roleTitle: a.roleTitle }; });
}
route("GET", "/api/interviews/upcoming", true, ({ user, query }) => { const days = Number(query.get("days") ?? 7); if (days < 1 || days > 30) throw validation("Upcoming interview days must be between 1 and 30."); return [200, upcoming(user.id, days)]; });

// ---- Dashboard ----
route("GET", "/api/dashboard/summary", true, ({ user }) => {
  const active = db.apps.filter((a) => a.userId === user.id && a.currentStatus !== "Archived");
  const byStatus = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn"].map((s) => ({ status: s, count: active.filter((a) => a.currentStatus === s).length }));
  const plat = {}; for (const a of active) { const k = a.platform.toLowerCase(); plat[k] ??= { platform: a.platform, count: 0 }; plat[k].count++; }
  const overdue = db.followUps.filter((f) => !f.isCompleted && f.dueDate < todayUtc() && active.some((a) => a.id === f.jobApplicationId))
    .map((f) => { const a = db.apps.find((x) => x.id === f.jobApplicationId); return { id: f.id, jobApplicationId: f.jobApplicationId, companyName: a.companyName, roleTitle: a.roleTitle, title: f.title, dueDate: f.dueDate, notes: f.notes, isOverdue: true, createdAtUtc: f.createdAtUtc, updatedAtUtc: f.updatedAtUtc }; });
  return [200, { activeApplicationCount: active.length, applicationsByStatus: byStatus, applicationsByPlatform: Object.values(plat).sort((a, b) => b.count - a.count), upcomingInterviews: upcoming(user.id, 7), overdueFollowUps: overdue }];
});
route("GET", "/api/Test/welcome", false, () => [200, { message: "Welcome to JobTrack API" }]);


const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS" };
http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  const url = new URL(req.url, "http://x");
  let raw = ""; for await (const c of req) raw += c;
  try {
    let body = {};
    if (raw) { try { body = JSON.parse(raw); } catch { throw modelInvalid("$", "The JSON value could not be converted."); } }
    const r = routes.find((x) => x.method === req.method && x.re.test(url.pathname));
    if (!r) { res.writeHead(404, cors); return res.end(); }
    const params = url.pathname.match(r.re).groups ?? {};
    let user = null;
    if (r.auth) {
      const payload = verifyJwt((req.headers.authorization ?? "").replace(/^Bearer /, ""));
      user = payload && db.users.find((u) => u.id === payload.sub);
      if (!user) { res.writeHead(401, cors); return res.end(); }
    }
    const [status, data] = r.handler({ user, params, body, query: url.searchParams });
    res.writeHead(status, { ...cors, ...(data ? { "Content-Type": "application/json" } : {}) });
    res.end(data ? JSON.stringify(data) : undefined);
  } catch (e) {
    if (!(e instanceof HttpError)) { console.error(e); e = fail(500, "Server.Error", "An unexpected error occurred."); }
    res.writeHead(e.status, { ...cors, "Content-Type": "application/json" });
    res.end(JSON.stringify(e.body));
  }
}).listen(PORT, () => console.log(`Mock JobTrack API on http://localhost:${PORT}/api`));
