using System.Net;
using JobTrack.Common.Exceptions;
using JobTrack.Common.Results;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace JobTrack.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, error) = exception switch
        {
            NotFoundException => (
                HttpStatusCode.NotFound,
                Error.NotFound("Resource.NotFound", exception.Message)),

            ValidationException => (
                HttpStatusCode.BadRequest,
                Error.Validation("Request.Validation", exception.Message)),

            ConflictException => (
                HttpStatusCode.Conflict,
                Error.Conflict("Resource.Conflict", exception.Message)),

            DbUpdateException dbUpdateException
                when IsResumeUniqueConstraintViolation(dbUpdateException) => (
                    HttpStatusCode.Conflict,
                    Error.Conflict(
                        "Resume.VersionConflict",
                        "A resume version with this filename already exists. "
                        + "Change the filename or select the existing version.")),

            DbUpdateException dbUpdateException
                when IsUniqueConstraintViolation(dbUpdateException) => (
                    HttpStatusCode.Conflict,
                    Error.Conflict(
                        "Resource.Conflict",
                        "A record with the same unique value already exists.")),

            UnauthorizedException => (
                HttpStatusCode.Unauthorized,
                Error.Failure("Authentication.Unauthorized", exception.Message)),

            _ => (
                HttpStatusCode.InternalServerError,
                Error.Failure("Server.Error", "An unexpected error occurred."))
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception occurred.");
        }

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(Result.Failure(error));
    }

    private static bool IsResumeUniqueConstraintViolation(DbUpdateException exception)
    {
        return exception.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.UniqueViolation,
            ConstraintName: "UX_resume_UserId_FileName" or "UX_resume_ObjectKey",
        };
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException exception)
    {
        return exception.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.UniqueViolation,
        };
    }
}
