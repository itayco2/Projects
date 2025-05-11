using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FluentValidation;

namespace AdiCohenFit.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RecipeCategoryController : ControllerBase
{
    private readonly IRecipeCategoryService _categoryService;
    private readonly IValidator<RecipeCategoryDto> _validator;

    public RecipeCategoryController(IRecipeCategoryService categoryService, IValidator<RecipeCategoryDto> validator)
    {
        _categoryService = categoryService;
        _validator = validator;
    }

    // GET: api/RecipeCategory
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecipeCategoryDto>>> GetCategories()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    // GET: api/RecipeCategory/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeCategoryDto>> GetCategory(Guid id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);

        if (category == null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    // POST: api/RecipeCategory
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RecipeCategoryDto>> PostCategory(RecipeCategoryDto categoryDto)
    {
        var validationResult = await _validator.ValidateAsync(categoryDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var createdCategory = await _categoryService.AddCategoryAsync(categoryDto);
        return CreatedAtAction(nameof(GetCategory), new { id = createdCategory.Id }, createdCategory);
    }

    // PUT: api/RecipeCategory/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> PutCategory(Guid id, RecipeCategoryDto categoryDto)
    {
        if (id != categoryDto.Id)
        {
            return BadRequest("ID mismatch");
        }

        var validationResult = await _validator.ValidateAsync(categoryDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var updatedCategory = await _categoryService.UpdateCategoryAsync(categoryDto);
        if (updatedCategory == null)
        {
            return NotFound();
        }

        return Ok(updatedCategory);
    }

    // DELETE: api/RecipeCategory/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var result = await _categoryService.DeleteCategoryAsync(id);
        if (!result)
        {
            return BadRequest("Category cannot be deleted. It may contain recipes or not exist.");
        }

        return NoContent();
    }
}