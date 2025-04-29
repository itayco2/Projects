using System.ComponentModel.DataAnnotations;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace University_backend;

// Service class for managing courses
public class CourseService : IDisposable
{
    private readonly UniversityContext _db;
    private readonly IMapper _mapper;

    // Constructor that accepts UniversityContext and IMapper instances
    public CourseService(UniversityContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    // Retrieves all courses asynchronously
    public async Task<List<CourseDto>> GetAllCoursesAsync()
    {
        return await _db.Courses
            .AsNoTracking()
            .ProjectTo<CourseDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    // Retrieves a single course by its ID asynchronously
    public async Task<CourseDto?> GetOneCourseAsync(Guid id)
    {
        return await _db.Courses
            .AsNoTracking()
            .Where(c => c.Id == id)
            .ProjectTo<CourseDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    // Adds a new course asynchronously
    public async Task<CourseDto> AddCourseAsync(CourseDto courseDto)
    {
        Course course = _mapper.Map<Course>(courseDto);

        if (course.CreatedAt == default)
        {
            course.CreatedAt = DateTime.UtcNow;
        }

        await _db.Courses.AddAsync(course);
        await _db.SaveChangesAsync();

        return _mapper.Map<CourseDto>(course);
    }

    // Updates a course title and description by its ID asynchronously
    public async Task<CourseDto?> UpdateCourseTitleAndDescriptionAsync(CourseDto courseDto)
    {
        Course? dbCourse = await _db.Courses.FindAsync(courseDto.Id);

        if (dbCourse == null) return null;

        // Update only the title and description fields
        dbCourse.Title = courseDto.Title;
        dbCourse.Description = courseDto.Description;

        await _db.SaveChangesAsync();

        CourseDto updatedCourseDto = _mapper.Map<CourseDto>(dbCourse);
        return updatedCourseDto;
    }


    // Deletes a course by its ID asynchronously
    public async Task<bool> DeleteCourseAsync(Guid id)
    {
        Course? dbCourse = await _db.Courses.FindAsync(id);
        if (dbCourse == null) return false;

        if (_db.Enrollments.AsNoTracking().Any(e => e.CourseId == dbCourse.Id))
        {
            throw new ValidationException("This course already has enrollments and cannot be modified.");
        }

        _db.Courses.Remove(dbCourse);
        await _db.SaveChangesAsync();
        return true;
    }

    // Disposes the database context
    public void Dispose()
    {
        _db.Dispose();
    }
}
