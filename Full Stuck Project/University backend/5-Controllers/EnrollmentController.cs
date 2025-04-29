using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace University_backend;

[ApiController]
public class EnrollmentController : ControllerBase
{
    private readonly EnrollmentService _enrollmentService;

    // Constructor that accepts an EnrollmentService instance
    public EnrollmentController(EnrollmentService enrollmentService) => _enrollmentService = enrollmentService;

    // Creates a new enrollment asynchronously
    [HttpPost("api/enrollments")]
    public async Task<IActionResult> CreateEnrollmentAsync([FromForm] EnrollmentDto enrollmentDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ValidationError(ModelState.GetAllErrors()));
        try
        {
            EnrollmentDto createdEnrollmentDto = await _enrollmentService.CreateEnrollmentAsync(enrollmentDto);
            return Created("api/enrollments/" + createdEnrollmentDto.Id, createdEnrollmentDto);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ValidationError(ex.Message));
        }
    }

    // Retrieves all enrollments for a user by their ID asynchronously
    [HttpGet("api/enrollments/user/{userId}")]
    public async Task<IActionResult> GetEnrollmentsByUserId([FromRoute] Guid userId)
    {
        IEnumerable<Enrollment> enrollments = await _enrollmentService.GetEnrollmentsByUserId(userId);
        return Ok(enrollments);
    }

    // Checks if a user is enrolled in a course asynchronously
    [HttpGet("api/enrollments/is-enrolled/{userId}/{courseId}")]
    public async Task<IActionResult> IsUserEnrolled([FromRoute] Guid userId, [FromRoute] Guid courseId)
    {
        if (userId == Guid.Empty || courseId == Guid.Empty)
        {
            return BadRequest("Invalid user or course ID.");
        }

        bool isEnrolled = await _enrollmentService.IsUserAlreadyEnrolled(userId, courseId);
        return Ok(isEnrolled);
    }

    // Deletes an enrollment by its ID asynchronously
    [HttpDelete("api/enrollments/{id}")]
    public async Task<IActionResult> DeleteEnrollmentAsync([FromRoute] Guid id)
    {
        if (!ModelState.IsValid) return BadRequest(new ValidationError(ModelState.GetFirstError()));
        bool success = await _enrollmentService.DeleteEnrollmentAsync(id);
        if (!success) return NotFound(new ResourceNotFound(id));
        return NoContent();
    }
}
