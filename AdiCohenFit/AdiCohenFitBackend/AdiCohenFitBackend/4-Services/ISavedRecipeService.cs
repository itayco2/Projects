using AdiCohenFIt;

namespace AdiCohenFit.Services;

public interface ISavedRecipeService
{
    Task<IEnumerable<SavedRecipeDto>> GetUserSavedRecipesAsync(Guid userId);
    Task<SavedRecipeDto?> GetSavedRecipeAsync(Guid recipeId, Guid userId);
    Task<SavedRecipeDto> SaveRecipeAsync(Guid userId, SaveRecipeRequestDto request);
    Task<bool> RemoveSavedRecipeAsync(Guid recipeId, Guid userId);
    Task<bool> IsRecipeSavedAsync(Guid recipeId, Guid userId);
}