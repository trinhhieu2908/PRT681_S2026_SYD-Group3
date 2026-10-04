# JobTrack — Automation Tests

Automated API and end-to-end UI tests for the JobTrack web application
(PRT681 Group 3), built with [Playwright](https://playwright.dev) + TypeScript.

| Project | What it tests | Tests |
|---|---|---|
| `api` | The ASP.NET Core REST API directly (no browser) | 77 |
| `ui`  | The React frontend in Chromium, end to end | 40 |

## Folder structure

```text
automation-tests/
  playwright.config.ts     Projects, reporters, base URLs
  fixtures.ts              `api` (fresh logged-in user) and `authedPage` fixtures
  utils/
    api-client.ts          REST client used by tests and for UI test setup
    test-data.ts           Unique emails, sample applications, date helpers
  pages/                   Page Object Model (login, list, detail pages)
  tests/
    api/                   auth, job applications, search/filter, status workflow,
                           follow-ups & interviews, dashboard
    ui/                    auth, job applications, search/filter, status workflow,
                           follow-ups, navigation/logout
  mock-api/server.mjs      In-memory stand-in for the backend (dev aid only, see below)
```

Every test registers its own new user, so tests never share data, can run in
parallel, and can be re-run against the same database.

## 1. Start the application

From `Web Application/backend`:

```bash
docker compose -f docker-compose.yml up -d          # PostgreSQL on :5432
dotnet ef database update --project src/JobTrack.Database --startup-project src/JobTrack.Api
dotnet run --project src/JobTrack.Api/JobTrack.Api.csproj --launch-profile http   # API on :5100
```

The API validates S3 settings on start-up. If you are not testing uploads, dummy
values are fine:

```bash
export S3__AccessKey=dummy S3__SecretKey=dummy S3__BucketName=dummy
```

(Windows PowerShell: `$env:S3__AccessKey="dummy"` etc.)

From `Web Application/frontend` (with `.env` containing
`VITE_API_BASE_URL=http://localhost:5100/api`):

```bash
npm install
npm run dev                                          # UI on :5173
```

## 2. Run the tests

```bash
cd automation-tests
npm install
npx playwright install chromium

npm test              # everything
npm run test:api      # API tests only
npm run test:ui       # UI tests only
npm run test:headed   # watch the browser
npm run report        # open the HTML report
```

Tests are slow or timing out on your machine? Lower parallelism with `npx playwright test --workers=2`.

Different ports? Set `FRONTEND_URL` and `API_URL` (see `.env.example`).

Run a single test by ID: `npx playwright test -g "API-WF-03"`.

## 3. Reports

- `playwright-report/` — HTML report (screenshots, video and trace for failures)
- `test-results/junit.xml` — JUnit XML for CI or for importing into a test log

## Test ID prefixes

| Prefix | Area |
|---|---|
| API-AUTH / UI-AUTH | Registration, login, tokens, logout |
| API-JA / UI-JA | Create / view / edit job applications |
| API-SF / UI-SF | Search, filters, pagination |
| API-WF / UI-WF | Status workflow, skip-to-offer, archive/unarchive |
| API-FU / UI-FU | Follow-ups |
| API-IV | Interviews |
| API-DB / UI-NAV | Dashboard, navigation, sign-out |

## Known issues found by the suite

1. **API-JA-10 — clearing a link fails (probable defect).** The README and the
   detail page clear a link by sending `""` (e.g. `{"jobLink": ""}`), but
   `UpdateJobApplicationRequest` has `[Url]` on the link fields and .NET's
   `UrlAttribute` rejects an empty string, so the API returns 400. Suggested fix:
   remove `[Url]` from the update contract and validate non-empty values in
   `JobApplicationService`, or have the frontend send `null` plus a separate
   "clear" flag.
2. **UI-SF-07 — unreachable error message (minor).** The "To date" filter input
   has `min={fromDate}` and the filter form is not `noValidate`, so the browser's
   native validation blocks submit before the custom "From date cannot be later
   than to date." message can show. The test asserts the actual behaviour (the
   invalid range is never applied).

## Not covered

- Résumé / cover-letter upload and preview (needs real S3 credentials).
- Overdue follow-ups on the dashboard (the API forbids past due dates, so this
  needs seeded data in the database).
- Access-token expiry and silent refresh after 15 minutes in the UI.

## About `mock-api/`

`mock-api/server.mjs` is an in-memory copy of the backend's routes, validation,
status workflow and error formats. It was used to verify the suite where the
real .NET backend could not be built. It is a development aid only: always
report results from a run against the real backend.

```bash
npm run mock-api      # serves http://localhost:5100/api
```
