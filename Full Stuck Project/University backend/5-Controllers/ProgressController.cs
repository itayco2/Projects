using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace University_backend;

[ApiController]
public class ProgressController : ControllerBase
{
    private readonly ProgressService _progressService;
    private readonly IMapper _mapper;

    // Constructor that accepts ProgressService and IMapper instances
    public ProgressController(ProgressService progressService, IMapper mapper)
    {
        _progressService = progressService;
        _mapper = mapper;
    }

    // Creates a new progress record asynchronously
    [HttpPost("api/progress")]
    public async Task<IActionResult> CreateProgressAsync([FromBody] ProgressDto progressDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ValidationError(ModelState.GetAllErrors()));

        try
        {
            ProgressDto createdProgressDto = await _progressService.CreateProgressAsync(progressDto);
            return CreatedAtAction(nameof(GetProgressById), new { id = createdProgressDto.Id }, createdProgressDto);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ValidationError(ex.Message));
        }
    }

    // Retrieves a progress record by its ID asynchronously
    [HttpGet("api/progress/{id}")]
    public async Task<IActionResult> GetProgressById(Guid id)
    {
        ProgressDto? progressDto = await _progressService.GetProgressByIdAsync(id);
        if (progressDto == null)
            return NotFound(new ResourceNotFound(id));
        return Ok(progressDto);
    }

    // Retrieves the total and watched lessons for a user in a course asynchronously
    [HttpGet("api/progress/user/{userId}/course/{courseId}/progress")]
    public async Task<IActionResult> GetCourseProgressAsync([FromRoute] Guid userId, [FromRoute] Guid courseId)
    {
        (int totalLessons, int watchedLessons) = await _progressService.GetCourseProgressAsync(userId, courseId);

        return Ok(new
        {
            TotalLessons = totalLessons,
            WatchedLessons = watchedLessons
        });
    }
}
