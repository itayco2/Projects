using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace University_backend;

// Service class for managing progress records
public class ProgressService : IDisposable
{
    private readonly UniversityContext _db;
    private readonly IMapper _mapper;

    // Constructor that accepts UniversityContext and IMapper instances
    public ProgressService(UniversityContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    // Creates a new progress record asynchronously
    public async Task<ProgressDto> CreateProgressAsync(ProgressDto progressDto)
    {
        Progress progress = _mapper.Map<Progress>(progressDto);

        bool userExists = await UserExists(progress.UserId);
        bool lessonExists = await LessonExists(progress.LessonId);

        if (!userExists || !lessonExists)
            throw new InvalidOperationException("Invalid User or Lesson.");

        bool progressExists = await ProgressExists(progress.UserId, progress.LessonId);

        if (progressExists)
            throw new InvalidOperationException("Progress already recorded for this lesson.");

        _db.Progress.Add(progress);
        await _db.SaveChangesAsync();

        ProgressDto createdProgressDto = _mapper.Map<ProgressDto>(progress);
        return createdProgressDto;
    }

    // Checks if a user exists by their ID
    public async Task<bool> UserExists(Guid userId)
    {
        bool userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        return userExists;
    }

    // Retrieves a progress record by its ID asynchronously
    public async Task<ProgressDto?> GetProgressByIdAsync(Guid id)
    {
        return await _db.Progress
            .AsNoTracking()
            .Where(p => p.Id == id)
            .ProjectTo<ProgressDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    // Checks if a lesson exists by its ID
    public async Task<bool> LessonExists(Guid lessonId)
    {
        bool lessonExists = await _db.Lessons.AnyAsync(l => l.Id == lessonId);
        return lessonExists;
    }

    // Checks if a progress record already exists for a user and lesson
    public async Task<bool> ProgressExists(Guid userId, Guid lessonId)
    {
        bool progressExists = await _db.Progress
            .AnyAsync(p => p.UserId == userId && p.LessonId == lessonId);

        return progressExists;
    }

    // Retrieves the total and watched lessons for a user in a course asynchronously
    public async Task<(int TotalLessons, int WatchedLessons)> GetCourseProgressAsync(Guid userId, Guid courseId)
    {
        int totalLessons = await _db.Lessons
            .Where(l => l.CourseId == courseId)
            .CountAsync();
        Console.WriteLine($"Total lessons: {totalLessons} for CourseId: {courseId}");

        int watchedLessons = await _db.Progress
            .Where(p => p.UserId == userId && p.Lesson.CourseId == courseId && p.WatchedAt != null)
            .CountAsync();
        Console.WriteLine($"Watched lessons: {watchedLessons} for UserId: {userId}, CourseId: {courseId}");

        return (TotalLessons: totalLessons, WatchedLessons: watchedLessons);
    }

    // Disposes the database context
    public void Dispose()
    {
        _db.Dispose();
    }
}
