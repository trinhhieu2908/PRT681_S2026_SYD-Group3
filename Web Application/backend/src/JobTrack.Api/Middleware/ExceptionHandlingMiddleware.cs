using System.Net;
using JobTrack.Common.Exceptions;
using JobTrack.Common.Results;

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
}
