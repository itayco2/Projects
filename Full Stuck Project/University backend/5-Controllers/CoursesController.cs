using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace University_backend;

[ApiController]
public class CoursesController : ControllerBase
{
    private readonly CourseService _courseService;

    // Constructor that accepts a CourseService instance
    public CoursesController(CourseService courseService) => _courseService = courseService;

    // Retrieves all courses asynchronously
    [HttpGet("api/courses")]
    public async Task<IActionResult> GetAllCoursesAsync()
    {
        List<CourseDto> courses = await _courseService.GetAllCoursesAsync();
        return Ok(courses);
    }

    // Retrieves a single course by its ID asynchronously
    [HttpGet("api/courses/{id}")]
    public async Task<IActionResult> GetOneCourseAsync([FromRoute] Guid id)
    {
        CourseDto? dbCourse = await _courseService.GetOneCourseAsync(id);
        if (dbCourse == null) return NotFound(new ResourceNotFound(id));
        return Ok(dbCourse);
    }

    // Adds a new course asynchronously
    [HttpPost("api/courses")]
    public async Task<IActionResult> AddCourseAsync([FromForm] CourseDto courseDto)
    {
        if (!ModelState.IsValid) return BadRequest(new ValidationError(ModelState.GetAllErrors()));
        CourseDto addedCourseDto = await _courseService.AddCourseAsync(courseDto);
        return Created("api/courses/" + addedCourseDto.Id, addedCourseDto);
    }

    // Updates a course title and description by its ID asynchronously
    [HttpPut("api/courses/{id}")]
    public async Task<IActionResult> UpdateCourseTitleAndDescriptionAsync([FromRoute] Guid id, [FromForm] CourseDto courseDto)
    {
        if (!ModelState.IsValid) return BadRequest(new ValidationError(ModelState.GetFirstError()));

        courseDto.Id = id;

        CourseDto? updatedCourseDto = await _courseService.UpdateCourseTitleAndDescriptionAsync(courseDto);

        if (updatedCourseDto == null) return NotFound(new ResourceNotFound(id));

        return Ok(updatedCourseDto);
    }


    // Deletes a course by its ID asynchronously
    [HttpDelete("api/courses/{id}")]
    public async Task<IActionResult> DeleteCourseAsync([FromRoute] Guid id)
    {
        // Check if the model state is valid
        if (!ModelState.IsValid)
            return BadRequest(new ValidationError(ModelState.GetFirstError()));

        try
        {
            bool success = await _courseService.DeleteCourseAsync(id);

            if (!success)
                return NotFound(new ResourceNotFound(id)); // If course not found, return 404

            return NoContent(); 
        }
        catch (ValidationException err)
        {
            return BadRequest(new ValidationError(err.Message)); // Return 400 with the validation error message
        }
    }

}


