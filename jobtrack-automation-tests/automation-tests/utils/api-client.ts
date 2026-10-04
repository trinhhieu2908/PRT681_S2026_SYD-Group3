import { APIRequestContext, APIResponse, expect } from "@playwright/test";
import { API_URL } from "../playwright.config";
import { CreateApplication, newApplication, uniqueEmail, VALID_PASSWORD } from "./test-data";

export interface Tokens {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
}
export interface Session { userId: string; email: string; password: string; tokens: Tokens; }

/** Thin wrapper over the JobTrack REST API used by both API tests and UI test setup. */
export class JobTrackApi {
  constructor(private readonly request: APIRequestContext, public session?: Session) {}

  private headers(token = this.session?.tokens.accessToken) {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  private url = (path: string) => `${API_URL}${path}`;

  get = (path: string, token?: string | null) =>
    this.request.get(this.url(path), { headers: token === null ? {} : this.headers(token) });
  post = (path: string, data?: unknown, token?: string | null) =>
    this.request.post(this.url(path), { data, headers: token === null ? {} : this.headers(token) });
  put = (path: string, data: unknown) => this.request.put(this.url(path), { data, headers: this.headers() });
  patch = (path: string, data: unknown) => this.request.patch(this.url(path), { data, headers: this.headers() });
  delete = (path: string) => this.request.delete(this.url(path), { headers: this.headers() });

  // ---------- Auth ----------
  register(email: string, password: string) {
    return this.request.post(this.url("/auth/register"), { data: { email, password } });
  }
  login(email: string, password: string) {
    return this.request.post(this.url("/auth/login"), { data: { email, password } });
  }

  /** Registers a brand-new user and stores the session on this client. */
  async createUser(email = uniqueEmail(), password = VALID_PASSWORD): Promise<Session> {
    const res = await this.register(email, password);
    await expectStatus(res, 201);
    const body = await res.json();
    this.session = { userId: body.userId, email: body.email, password, tokens: body.tokens };
    return this.session;
  }

  // ---------- Job applications ----------
  async createApplication(data: Partial<CreateApplication> = {}) {
    const res = await this.post("/job-applications", newApplication(data));
    await expectStatus(res, 201);
    return res.json();
  }
  listApplications(params: Record<string, string | number> = {}) {
    const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
    return this.get(`/job-applications${qs.size ? `?${qs}` : ""}`);
  }
  changeStatus(id: string, newStatus: string, skipToOffer = false) {
    return this.patch(`/job-applications/${id}/status`, { newStatus, skipToOffer });
  }
  async moveTo(id: string, ...path: string[]) {
    for (const status of path) await expectStatus(await this.changeStatus(id, status), 200);
  }

  // ---------- Follow-ups / interviews ----------
  async createFollowUp(appId: string, data: { title: string; dueDate: string; notes?: string | null }) {
    const res = await this.post(`/job-applications/${appId}/follow-ups`, data);
    await expectStatus(res, 201);
    return res.json();
  }
  async createInterview(appId: string, data: Record<string, unknown>) {
    const res = await this.post(`/job-applications/${appId}/interviews`, data);
    await expectStatus(res, 201);
    return res.json();
  }
}

/** Asserts a status code and prints the response body when it does not match. */
export async function expectStatus(res: APIResponse, status: number) {
  if (res.status() !== status) {
    const body = await res.text().catch(() => "");
    expect(res.status(), `Expected ${status} from ${res.url()} — body: ${body}`).toBe(status);
  }
}

/** Reads the error message from the API's Result.Failure envelope. */
export async function errorMessage(res: APIResponse): Promise<string> {
  const body = await res.json();
  return body?.error?.message ?? body?.title ?? "";
}

export { newApplication, uniqueEmail, VALID_PASSWORD };
