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
POST /api/auth/revoke
```

Access tokens expire after 15 minutes. Refresh tokens expire after 180 days
and are rotated and stored as hashes in the database.

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

