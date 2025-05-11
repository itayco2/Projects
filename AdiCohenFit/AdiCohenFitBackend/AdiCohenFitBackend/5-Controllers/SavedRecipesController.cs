using AdiCohenFit;
using AdiCohenFit.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentValidation;
using FluentValidation.Results;
using AdiCohenFIt;
using System.Text.Json;

namespace AdiCohenFit.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SavedRecipesController : ControllerBase
{
    private readonly ISavedRecipeService _savedRecipeService;
    private readonly IValidator<SaveRecipeRequestDto> _saveRecipeValidator;

    // Inject the validator via constructor
    public SavedRecipesController(ISavedRecipeService savedRecipeService, IValidator<SaveRecipeRequestDto> saveRecipeValidator)
    {
        _savedRecipeService = savedRecipeService;
        _saveRecipeValidator = saveRecipeValidator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SavedRecipeDto>>> GetUserSavedRecipes()
    {
        try
        {
            var userId = GetCurrentUserId();
            var savedRecipes = await _savedRecipeService.GetUserSavedRecipesAsync(userId);
            return Ok(savedRecipes);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine($"Error getting saved recipes: {ex}");
            return StatusCode(500, $"An error occurred while retrieving saved recipes: {ex.Message}");
        }
    }

    [HttpGet("check/{recipeId}")]
    public async Task<ActionResult<bool>> IsRecipeSaved(Guid recipeId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isSaved = await _savedRecipeService.IsRecipeSavedAsync(recipeId, userId);
            return Ok(isSaved);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine($"Error checking saved recipe: {ex}");
            return StatusCode(500, $"An error occurred while checking if recipe is saved: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<SavedRecipeDto>> SaveRecipe([FromBody] SaveRecipeRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();

            // Validate the request using the injected validator (now only synchronous rules)
            var validationResult = _saveRecipeValidator.Validate(request);

            if (!validationResult.IsValid)
            {
                // Return validation errors if invalid
                return BadRequest(validationResult.Errors);
            }

            // Proceed to save the recipe if valid
            try
            {
                var savedRecipe = await _savedRecipeService.SaveRecipeAsync(userId, request);

                return CreatedAtAction(
                    nameof(IsRecipeSaved),
                    new { recipeId = request.RecipeId },
                    savedRecipe);
            }
            catch (ArgumentException ex) when (ex.ParamName == nameof(request.RecipeId))
            {
                // Handle the case where the recipe doesn't exist
                return NotFound(ex.Message);
            }
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine($"Error saving recipe: {ex}");
            return StatusCode(500, $"An error occurred while saving the recipe: {ex.Message}");
        }
    }

    [HttpDelete("{recipeId}")]
    public async Task<ActionResult> RemoveSavedRecipe(Guid recipeId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _savedRecipeService.RemoveSavedRecipeAsync(recipeId, userId);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine($"Error removing saved recipe: {ex}");
            return StatusCode(500, $"An error occurred while removing the saved recipe: {ex.Message}");
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            var userClaimValue = User.Claims.FirstOrDefault(c => c.Type == "user")?.Value;
            if (!string.IsNullOrEmpty(userClaimValue))
            {
                try
                {
                    var userObject = JsonSerializer.Deserialize<Dictionary<string, object>>(userClaimValue);
                    userIdClaim = userObject?["id"]?.ToString();
                }
                catch
                {
                    // Handle JSON parsing error
                }
            }
        }

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in claims");
        }

        return userId;
    }
}