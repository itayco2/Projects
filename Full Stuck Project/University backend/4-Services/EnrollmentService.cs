using AutoMapper.QueryableExtensions;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace University_backend;

// Service class for managing enrollments
public class EnrollmentService : IDisposable
{
    private readonly UniversityContext _db;
    private readonly IMapper _mapper;

    // Constructor that accepts UniversityContext and IMapper instances
    public EnrollmentService(UniversityContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    // Checks if a user exists by their ID
    public async Task<bool> UserExists(Guid userId)
    {
        return await _db.Users.AnyAsync(u => u.Id == userId);
    }

    // Checks if a course exists by its ID
    public async Task<bool> CourseExists(Guid courseId)
    {
        return await _db.Courses.AnyAsync(c => c.Id == courseId);
    }

    // Checks if a user is already enrolled in a course
    public async Task<bool> IsUserAlreadyEnrolled(Guid userId, Guid courseId)
    {
        return await _db.Enrollments
            .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);
    }

    // Retrieves all enrollments for a user by their ID
    public async Task<IEnumerable<Enrollment>> GetEnrollmentsByUserId(Guid userId)
    {
        return await _db.Enrollments
            .Where(e => e.UserId == userId)
            .ToListAsync();
    }

    // Creates a new enrollment asynchronously
    public async Task<EnrollmentDto> CreateEnrollmentAsync(EnrollmentDto enrollmentDto)
    {
        Enrollment enrollment = _mapper.Map<Enrollment>(enrollmentDto);

        bool userExists = await UserExists(enrollment.UserId);
        bool courseExists = await CourseExists(enrollment.CourseId);

        if (!userExists || !courseExists)
            throw new InvalidOperationException("Invalid User or Course.");

        bool isUserAlreadyEnrolled = await IsUserAlreadyEnrolled(enrollment.UserId, enrollment.CourseId);

        if (isUserAlreadyEnrolled)
            throw new InvalidOperationException("User is already enrolled in this course.");

        _db.Enrollments.Add(enrollment);
        await _db.SaveChangesAsync();

        EnrollmentDto enrolledDto = _mapper.Map<EnrollmentDto>(enrollment);
        return enrolledDto;
    }

    // Deletes an enrollment by course ID asynchronously
    public async Task<bool> DeleteEnrollmentAsync(Guid courseId)
    {
        Enrollment? dbEnrollment = await _db.Enrollments.FirstOrDefaultAsync(e => e.CourseId == courseId);
        if (dbEnrollment == null) return false;

        _db.Enrollments.Remove(dbEnrollment);

        int rowsAffected = await _db.SaveChangesAsync();
        Console.WriteLine($"Rows affected: {rowsAffected}");

        return rowsAffected > 0;
    }

    // Disposes the database context
    public void Dispose()
    {
        _db.Dispose();
    }
}