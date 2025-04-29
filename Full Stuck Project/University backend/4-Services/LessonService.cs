using AutoMapper.QueryableExtensions;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace University_backend;

// Service class for managing lessons
public class LessonService : IDisposable
{
    private readonly UniversityContext _db;
    private readonly IMapper _mapper;

    // Constructor that accepts UniversityContext and IMapper instances
    public LessonService(UniversityContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    // Retrieves all lessons asynchronously
    public async Task<List<LessonDto>> GetAllLessons()
    {
        return await _db.Lessons
            .AsNoTracking()
            .ProjectTo<LessonDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    // Retrieves a single lesson by its ID asynchronously
    public async Task<LessonDto?> GetOneLesson(Guid id)
    {
        return await _db.Lessons
            .AsNoTracking()
            .Where(l => l.Id == id)
            .ProjectTo<LessonDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    // Retrieves all lessons for a specific course asynchronously
    public async Task<List<LessonDto>> GetLessonsForCourse(Guid courseId)
    {
        return await _db.Lessons
            .AsNoTracking()
            .Where(l => l.CourseId == courseId)
            .ProjectTo<LessonDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    // Adds a new lesson asynchronously
    public async Task<LessonDto> AddLesson(LessonDto lessonDto)
    {
        Lesson lesson = _mapper.Map<Lesson>(lessonDto);

        if (lesson.Id == Guid.Empty)
        {
            lesson.Id = Guid.NewGuid();
        }

        if (lesson.CourseId == Guid.Empty && lessonDto.Course != null)
        {
            lesson.CourseId = lessonDto.Course.Id;
        }

        await _db.Lessons.AddAsync(lesson);
        await _db.SaveChangesAsync();

        return _mapper.Map<LessonDto>(lesson);
    }

    // Updates an existing lesson asynchronously
    public async Task<LessonDto?> UpdateFullLesson(LessonDto lessonDto)
    {
        Lesson? dbLesson = await _db.Lessons.FindAsync(lessonDto.Id);
        if (dbLesson == null) return null;

        _mapper.Map(lessonDto, dbLesson);

        await _db.SaveChangesAsync();

        return _mapper.Map<LessonDto>(dbLesson);
    }

    // Deletes a lesson by its ID asynchronously
    public async Task<bool> DeleteLesson(Guid id)
    {
        Lesson? dbLesson = await _db.Lessons.FindAsync(id);
        if (dbLesson == null) return false;

        _db.Lessons.Remove(dbLesson);
        await _db.SaveChangesAsync();
        return true;
    }

    // Disposes the database context
    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }
}
