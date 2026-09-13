using JobTrack.Common.Exceptions;
using JobTrack.Core.UnitOfWork;
using JobTrack.Modules.Documents.Contracts;
using JobTrack.Modules.Documents.Entities;
using JobTrack.Modules.Documents.Repositories;
using JobTrack.Modules.JobApplication.Repositories;
using JobTrack.Modules.Storage.Enums;
using JobTrack.Modules.Storage.Services;

namespace JobTrack.Modules.Documents.Services;

public sealed class DocumentService(
    IResumeRepository resumeRepository,
    ICoverLetterRepository coverLetterRepository,
    IJobApplicationRepository jobApplicationRepository,
    IUnitOfWork unitOfWork)
    : IDocumentService
{
    public async Task<IReadOnlyList<ResumeResponse>> GetResumesAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var resumes = await resumeRepository.GetAllByUserIdAsync(
            userId,
            cancellationToken);

        return resumes
            .Select(MapResumeResponse)
            .ToArray();
    }

    public async Task<ResumeResponse> SaveResumeAsync(
        Guid userId,
        SaveResumeRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.JobApplicationId == Guid.Empty)
        {
            throw new ValidationException("Job application ID is required.");
        }

        var fileName = StorageFileRules.ValidateFileName(request.FileName);
        var contentType = StorageFileRules.ValidateContentType(fileName, request.ContentType);
        StorageFileRules.ValidateObjectKey(
            userId,
            StorageContext.Resume,
            fileName,
            request.ObjectKey);

        var jobApplication = await jobApplicationRepository.GetForUpdateAsync(
            request.JobApplicationId,
            userId,
            cancellationToken)
            ?? throw new NotFoundException("Job application was not found.");

        if (await resumeRepository.ExistsByFileNameAsync(userId, fileName, cancellationToken))
        {
            throw new ConflictException(
                $"A resume version named '{fileName}' already exists. "
                + "Change the filename or select the existing version.");
        }

        var now = DateTime.UtcNow;
        var resume = new Resume
        {
            UserId = userId,
            FileName = fileName,
            ObjectKey = request.ObjectKey,
            ContentType = contentType,
            CreatedAtUtc = now,
        };

        await resumeRepository.AddAsync(resume, cancellationToken);

        jobApplication.ResumeId = resume.Id;
        jobApplication.UpdatedAtUtc = now;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MapResumeResponse(resume);
    }

    public async Task<CoverLetterResponse> SaveCoverLetterAsync(
        Guid userId,
        Guid jobApplicationId,
        SaveCoverLetterRequest request,
        CancellationToken cancellationToken = default)
    {
        var fileName = StorageFileRules.ValidateFileName(request.FileName);
        var contentType = StorageFileRules.ValidateContentType(fileName, request.ContentType);
        StorageFileRules.ValidateObjectKey(
            userId,
            StorageContext.CoverLetter,
            fileName,
            request.ObjectKey);

        var jobApplication = await jobApplicationRepository.GetForUpdateAsync(
            jobApplicationId,
            userId,
            cancellationToken)
            ?? throw new NotFoundException("Job application was not found.");

        var now = DateTime.UtcNow;
        var coverLetter = await coverLetterRepository.GetByJobApplicationIdForUpdateAsync(
            jobApplicationId,
            cancellationToken);

        if (coverLetter is null)
        {
            coverLetter = new CoverLetter
            {
                UserId = userId,
                JobApplicationId = jobApplicationId,
                FileName = fileName,
                ObjectKey = request.ObjectKey,
                ContentType = contentType,
                CreatedAtUtc = now,
            };

            await coverLetterRepository.AddAsync(coverLetter, cancellationToken);
        }
        else
        {
            coverLetter.UserId = userId;
            coverLetter.FileName = fileName;
            coverLetter.ObjectKey = request.ObjectKey;
            coverLetter.ContentType = contentType;
            coverLetter.UpdatedAtUtc = now;
        }

        jobApplication.UpdatedAtUtc = now;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MapCoverLetterResponse(coverLetter);
    }

    public static ResumeResponse MapResumeResponse(Resume resume)
    {
        return new ResumeResponse(
            resume.Id,
            resume.FileName,
            resume.ObjectKey,
            resume.ContentType,
            resume.CreatedAtUtc,
            resume.UpdatedAtUtc);
    }

    public static CoverLetterResponse MapCoverLetterResponse(CoverLetter coverLetter)
    {
        return new CoverLetterResponse(
            coverLetter.Id,
            coverLetter.JobApplicationId,
            coverLetter.FileName,
            coverLetter.ObjectKey,
            coverLetter.ContentType,
            coverLetter.CreatedAtUtc,
            coverLetter.UpdatedAtUtc);
    }
}
