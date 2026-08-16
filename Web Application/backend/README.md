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
- Generic repository base
- Unit of work abstraction
- Shared common result and exception types

Feature modules are not implemented yet.
