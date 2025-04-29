using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace University_backend;

[ApiController]
public class LessonController : ControllerBase
{
    private readonly LessonService _lessonService;

    // Constructor that accepts a LessonService instance
    public LessonController(LessonService lessonService) => _lessonService = lessonService;

    // Retrieves all lessons asynchronously
    [HttpGet("api/lessons")]
    public async Task<IActionResult> GetAllLessons()
    {
        List<LessonDto> lessons = await _lessonService.GetAllLessons();
        return Ok(lessons);
    }

    // Retrieves a single lesson by its ID asynchronously
    [HttpGet("api/lessons/{id}")]
    public async Task<IActionResult> GetOneLesson([FromRoute] Guid id)
    {
        LessonDto? dbLesson = await _lessonService.GetOneLesson(id);
        if (dbLesson == null) return NotFound(new ResourceNotFound(id));
        return Ok(dbLesson);
    }

    // Retrieves all lessons for a specific course asynchronously
    [HttpGet("api/courses/{courseId}/lessons")]
    public async Task<IActionResult> GetLessonsForCourse([FromRoute] Guid courseId)
    {
        List<LessonDto> lessons = await _lessonService.GetLessonsForCourse(courseId);
        return Ok(lessons);
    }

    // Updates an existing lesson asynchronously
    [HttpPut("api/lessons/{courseId}/{id}")]
    public async Task<IActionResult> UpdateFullLesson([FromRoute] Guid courseId, [FromRoute] Guid id, [FromBody] LessonDto lessonDto)
    {
        if (!ModelState.IsValid) return BadRequest(new ValidationError(ModelState.GetFirstError()));

        lessonDto.Id = id;
        lessonDto.CourseId = courseId;

        LessonDto? dbLesson = await _lessonService.UpdateFullLesson(lessonDto);

        if (dbLesson == null) return NotFound(new ResourceNotFound(id));
        return Ok(dbLesson);
    }

    // Adds a new lesson asynchronously
    [HttpPost("api/lessons")]
    public async Task<IActionResult> AddLesson([FromBody] LessonDto lessonDto)
    {
        if (!ModelState.IsValid) return BadRequest(new ValidationError(ModelState.GetAllErrors()));

        LessonDto dbLesson = await _lessonService.AddLesson(lessonDto);
        return Created($"api/lessons/{dbLesson.Id}", dbLesson);
    }

    // Deletes a lesson by its ID asynchronously
    [HttpDelete("api/lessons/{id}")]
    public async Task<IActionResult> DeleteLesson([FromRoute] Guid id)
    {
        bool success = await _lessonService.DeleteLesson(id);
        if (!success) return NotFound(new ResourceNotFound(id));
        return NoContent();
    }
}
