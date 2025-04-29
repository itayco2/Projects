using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AdiCohenFit;

[ApiController]
public class WorkshopController : ControllerBase, IDisposable
{
    private readonly WorkshopService _workshopService;

    public WorkshopController(WorkshopService workshopService) => _workshopService = workshopService;
    

    [HttpGet("api/workshops")]
    public async Task<IActionResult> GetAllWorkshops()
    {
        List<WorkshopDto> workshops = await _workshopService.GetAllWorkshops();
        return Ok(workshops);
    }

    [HttpGet("api/workshops/{id}")]
    public async Task<IActionResult> GetOneWorkshop([FromRoute] Guid id)
    {
       WorkshopDto? dbWorkshop = await _workshopService.GetOneWorkshop(id);
       if (dbWorkshop == null)  return NotFound((new ResourceNotFound(id)));
       return Ok(dbWorkshop);
    }

    [HttpPost("api/workshops")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddWorkshop([FromForm] WorkshopDto workshopDto)
    {
        ModelState.Remove("Id");
        ModelState.Remove("ImageName");
        if (!ModelState.IsValid) return BadRequest(new ValidationError(ModelState.GetAllErrors()));
        WorkshopDto dbWorkshop = await _workshopService.AddWorkshop(workshopDto);
        return Created("api/workshops/" + dbWorkshop.Id, dbWorkshop);
    }

    [HttpPut("api/workshops/{id}")]
    [Consumes("multipart/form-data")]
    [Authorize(Roles ="Admin")]
    public async Task<IActionResult> UpdateWorkshop([FromRoute] Guid id, [FromForm] WorkshopDto workshopDto)
    {
        ModelState.Remove("ImageName");
        if (!ModelState.IsValid) return BadRequest(new ValidationError(ModelState.GetAllErrors()));
        workshopDto.Id = id;
        WorkshopDto? dbWorkshop = await _workshopService.UpdateWorkshopAsync(workshopDto);
        if (dbWorkshop == null) return NotFound(new ResourceNotFound(id));
        return Ok(dbWorkshop);


    }


    [HttpDelete("api/workshops/{id}")]
    public async Task<IActionResult> DeleteWorkshop([FromRoute] Guid id)
    {
       bool deleted= await _workshopService.DeleteWorkshopAsync(id);
        if (!deleted) return NotFound(new ResourceNotFound(id));
        return NoContent();

    }










    public void Dispose()
    {
        _workshopService.Dispose();
    }
}
