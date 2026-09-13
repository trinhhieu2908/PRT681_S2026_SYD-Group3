# JobTrack Backend

ASP.NET Core backend for JobTrack.

## Requirements

- .NET SDK 10
- Docker

## Project Structure

```text
backend/
  JobTrack.sln
  docker-compose.yml
  src/
    JobTrack.Api/        API setup, controllers, middleware, DI
    JobTrack.Modules/    Feature modules, contracts, business logic
    JobTrack.Database/   EF Core, DbContext, repositories, migrations
    JobTrack.Core/       Base entity and unit of work abstractions
    JobTrack.Common/     Shared results, pagination, exceptions
```

## Start Database

From the repository root:

```bash
docker compose -f backend/docker-compose.yml up -d
```

Postgres runs on:

```text
localhost:5432
```

Database settings:

```text
Database: job_track
Username: dylan
Password: dylan
```

To stop the database:

```bash
docker compose -f docker-compose.yml down
```

To stop and remove database data:

```bash
docker compose -f docker-compose.yml down -v
```

## Run Backend API

```bash
dotnet run --project src/JobTrack.Api/JobTrack.Api.csproj --launch-profile http
```

The API runs on:

```text
http://localhost:5100
```

## Swagger

Open Swagger UI:

```text
http://localhost:5100/swagger
```

Swagger JSON:

```text
http://localhost:5100/swagger/v1/swagger.json
```

## Authentication Endpoints

The authentication API provides:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/revoke
```

Access tokens expire after 15 minutes. Refresh tokens expire after 180 days
and are rotated and stored as hashes in the database. Registration and login
use an email address and password. The `revoke` endpoint is retained as an
alias for `logout`.

Registration passwords must be 8 to 128 characters and contain at least one
uppercase letter, one lowercase letter, one number, and one special character.
Email uniqueness is case-insensitive.

## Job Application Endpoints

Both endpoints require a valid JWT access token.

Create a job application:

```http
POST /api/job-applications
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "companyName": "Example Company",
  "roleTitle": "Software Developer",
  "platform": "LinkedIn",
  "jobLink": "https://example.com/jobs/software-developer",
  "portfolioLink": "https://example.com/portfolio",
  "gitHubLink": "https://github.com/example"
}
```

The API obtains `UserId` from the access token and sets `ApplicationDate` to
the current UTC date and `CurrentStatus` to `Applied`.

Get the authenticated user's applications with optional search, filters, and
pagination:

```http
GET /api/job-applications?search=developer&status=Interview&platform=LinkedIn&fromDate=2026-01-01&toDate=2026-12-31&pageNumber=1&pageSize=20
Authorization: Bearer <access-token>
```

All query parameters are optional:

- `search` matches company name or role title case-insensitively.
- `status` accepts a `JobApplicationStatus` value.
- `platform` matches the complete platform name case-insensitively.
- `fromDate` and `toDate` filter `ApplicationDate` inclusively.
- `pageNumber` starts at `1` and defaults to `1`.
- `pageSize` must be between `1` and `100` and defaults to `20`.

Filters are combined, and `fromDate` cannot be later than `toDate`.

Get one job application by ID:

```http
GET /api/job-applications/{id}
Authorization: Bearer <access-token>
```

The API returns `404 Not Found` when the record does not exist or belongs to a
different user.

## S3 Document Upload URLs

S3 credentials are stored with .NET User Secrets for local development and are
not written to `appsettings.json` or committed to Git. Configure them from the
`backend` directory:

```bash
dotnet user-secrets set "S3:AccessKey" "<aws-access-key>" \
  --project src/JobTrack.Api/JobTrack.Api.csproj

dotnet user-secrets set "S3:SecretKey" "<aws-secret-key>" \
  --project src/JobTrack.Api/JobTrack.Api.csproj

dotnet user-secrets set "S3:BucketName" "<s3-bucket-name>" \
  --project src/JobTrack.Api/JobTrack.Api.csproj
```

The default region is `ap-southeast-2`. Change it when the bucket is in another
region:

```bash
dotnet user-secrets set "S3:Region" "<aws-region>" \
  --project src/JobTrack.Api/JobTrack.Api.csproj
```

Generate one or more authenticated upload URLs:

```http
POST /api/storage/upload-presigned-urls
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "context": "resume",
  "fileNames": [
    "resume-v1.pdf",
    "resume-v2.docx"
  ]
}
```

`context` must be `resume` or `cover-letter`. Each request accepts between 1
and 10 PDF, DOC, or DOCX filenames. The authenticated user ID is taken from the
JWT and used to create keys such as:

```text
{userId}/resume/{uniqueId}-resume-v1.pdf
{userId}/cover-letter/{uniqueId}-cover-letter-v1.pdf
```

Upload each file directly to its `uploadUrl` with the returned `httpMethod` and
`Content-Type`. Keep the returned `objectKey`; the later document-record API
will store that key rather than the temporary URL.

The S3 bucket must allow browser `PUT` requests from the frontend origin. A
development CORS rule can use:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## Create and Apply EF Core Migration

Install the EF CLI if it is not already installed:

```bash
dotnet tool install --global dotnet-ef --version 10.0.11
```

```bash
dotnet ef migrations add CreateUsers \
  --project src/JobTrack.Database/JobTrack.Database.csproj \
  --startup-project src/JobTrack.Api/JobTrack.Api.csproj \
  --output-dir Migrations
```

This creates migration files inside:

```text
src/JobTrack.Database/Migrations/
```

Review the generated `CreateUsers.cs`, designer file, and model snapshot.
Do not execute those files individually.

Make sure the PostgreSQL container is running, then apply the migration:

```bash
dotnet ef database update \
  --project src/JobTrack.Database/JobTrack.Database.csproj \
  --startup-project src/JobTrack.Api/JobTrack.Api.csproj
```

The `migrations add` command only creates migration files. The `database update` command executes the migration against PostgreSQL and records it in
`__EFMigrationsHistory`.

To generate a SQL script for review or deployment instead of applying the
migration directly:

```bash
dotnet ef migrations script \
  --idempotent \
  --project src/JobTrack.Database/JobTrack.Database.csproj \
  --startup-project src/JobTrack.Api/JobTrack.Api.csproj \
  --output migrations.sql
```

## Reverse an EF Core Migration

Use this workflow only for a local migration that has not been shared with or
applied by other team members. Rolling back a migration can drop tables or
columns and permanently delete their data.

First, list the migrations and identify the migration immediately before the
one you want to reverse:

```bash
dotnet ef migrations list \
  --project src/JobTrack.Database/JobTrack.Database.csproj \
  --startup-project src/JobTrack.Api/JobTrack.Api.csproj
```

Roll the database back to the previous migration. If the migration being
removed is the first and only migration, use `0` as the target:

```bash
dotnet ef database update 0 \
  --project src/JobTrack.Database/JobTrack.Database.csproj \
  --startup-project src/JobTrack.Api/JobTrack.Api.csproj
```

If earlier migrations exist, replace `0` with the name of the previous
migration instead.

After the database rollback succeeds, remove the latest migration from the
codebase:

```bash
dotnet ef migrations remove \
  --project src/JobTrack.Database/JobTrack.Database.csproj \
  --startup-project src/JobTrack.Api/JobTrack.Api.csproj
```

This removes the migration and designer files and updates the EF Core model
snapshot. Do not delete these files manually. Run `dotnet ef migrations list`
again to confirm the migration was removed.

If a migration has already been committed, shared, or applied to another
environment, keep its history intact and create a new migration that changes
the schema instead of removing the old migration.

## Test Endpoint

```text
GET http://localhost:5100/api/test/welcome
```

Expected response:

```json
{
  "message": "Welcome to JobTrack API"
}
```

## Build

```bash
dotnet build backend/JobTrack.sln
```

## Restore Packages

```bash
dotnet restore backend/JobTrack.sln
```

## Current Status

The backend foundation is set up with:

- ASP.NET Core Web API
- Swagger UI
- EF Core with PostgreSQL
- Docker Compose Postgres database
- JWT authentication with access and refresh tokens
- Generic repository base
- Unit of work abstraction
- Shared common result and exception types
