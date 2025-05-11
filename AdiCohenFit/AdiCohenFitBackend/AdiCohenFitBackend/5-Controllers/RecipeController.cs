using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FluentValidation;

namespace AdiCohenFit.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RecipeController : ControllerBase
{
    private readonly IRecipeService _recipeService;
    private readonly IValidator<RecipeDto> _validator;

    public RecipeController(IRecipeService recipeService, IValidator<RecipeDto> validator)
    {
        _recipeService = recipeService;
        _validator = validator;
    }

    // GET: api/Recipe
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipes()
    {
        var recipes = await _recipeService.GetAllRecipesAsync();
        return Ok(recipes);
    }

    // GET: api/Recipe/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeDto>> GetRecipe(Guid id)
    {
        var recipe = await _recipeService.GetRecipeByIdAsync(id);

        if (recipe == null)
        {
            return NotFound();
        }

        return Ok(recipe);
    }

    // GET: api/Recipe/Category/5
    [HttpGet("Category/{categoryId}")]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipesByCategory(Guid categoryId)
    {
        var recipes = await _recipeService.GetRecipesByCategoryAsync(categoryId);
        return Ok(recipes);
    }

    // POST: api/Recipe
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RecipeDto>> PostRecipe([FromForm] RecipeDto recipeDto)
    {
        var validationResult = await _validator.ValidateAsync(recipeDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var createdRecipe = await _recipeService.AddRecipeAsync(recipeDto);
        return CreatedAtAction(nameof(GetRecipe), new { id = createdRecipe.Id }, createdRecipe);
    }

    // PUT: api/Recipe/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> PutRecipe(Guid id, [FromForm] RecipeDto recipeDto)
    {
        if (id != recipeDto.Id)
        {
            return BadRequest("ID mismatch");
        }

        var validationResult = await _validator.ValidateAsync(recipeDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var updatedRecipe = await _recipeService.UpdateRecipeAsync(recipeDto);
        if (updatedRecipe == null)
        {
            return NotFound();
        }

        return Ok(updatedRecipe);
    }

    // DELETE: api/Recipe/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteRecipe(Guid id)
    {
        var result = await _recipeService.DeleteRecipeAsync(id);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}