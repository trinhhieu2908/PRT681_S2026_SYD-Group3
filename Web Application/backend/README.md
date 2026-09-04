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
