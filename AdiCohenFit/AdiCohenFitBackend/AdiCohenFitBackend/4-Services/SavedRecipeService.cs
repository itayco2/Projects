using AdiCohenFit;
using AdiCohenFIt;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AdiCohenFit.Services;

public class SavedRecipeService : ISavedRecipeService
{
    private readonly WebsiteContext _context;
    private readonly IMapper _mapper;

    public SavedRecipeService(WebsiteContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<SavedRecipeDto>> GetUserSavedRecipesAsync(Guid userId)
    {
        var savedRecipes = await _context.SavedRecipes
            .Include(sr => sr.Recipe)
                .ThenInclude(r => r.Category)
            .Where(sr => sr.UserId == userId)
            .OrderByDescending(sr => sr.SavedAt)
            .ToListAsync();

        return _mapper.Map<IEnumerable<SavedRecipeDto>>(savedRecipes);
    }

    public async Task<SavedRecipeDto?> GetSavedRecipeAsync(Guid recipeId, Guid userId)
    {
        var savedRecipe = await _context.SavedRecipes
            .Include(sr => sr.Recipe)
                .ThenInclude(r => r.Category)
            .FirstOrDefaultAsync(sr => sr.RecipeId == recipeId && sr.UserId == userId);

        return savedRecipe != null ? _mapper.Map<SavedRecipeDto>(savedRecipe) : null;
    }

    public async Task<SavedRecipeDto> SaveRecipeAsync(Guid userId, SaveRecipeRequestDto request)
    {
        // First, check if the recipe exists
        var recipeExists = await _context.Recipes.AnyAsync(r => r.Id == request.RecipeId);
        if (!recipeExists)
        {
            throw new ArgumentException("Recipe not found", nameof(request.RecipeId));
        }

        // Check if the recipe is already saved by this user
        var existingSavedRecipe = await _context.SavedRecipes
            .FirstOrDefaultAsync(sr => sr.RecipeId == request.RecipeId && sr.UserId == userId);

        if (existingSavedRecipe != null)
        {
            // Recipe is already saved, just update the timestamp if needed
            existingSavedRecipe.SavedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Load the full entity with navigation properties
            await _context.Entry(existingSavedRecipe)
                .Reference(sr => sr.Recipe)
                .LoadAsync();

            await _context.Entry(existingSavedRecipe.Recipe)
                .Reference(r => r.Category)
                .LoadAsync();

            return _mapper.Map<SavedRecipeDto>(existingSavedRecipe);
        }

        // Create new saved recipe
        var savedRecipe = _mapper.Map<SavedRecipe>(request);
        savedRecipe.UserId = userId;
        savedRecipe.SavedAt = DateTime.UtcNow;

        _context.SavedRecipes.Add(savedRecipe);
        await _context.SaveChangesAsync();

        // Load the full entity with navigation properties for mapping
        await _context.Entry(savedRecipe)
            .Reference(sr => sr.Recipe)
            .LoadAsync();

        await _context.Entry(savedRecipe.Recipe)
            .Reference(r => r.Category)
            .LoadAsync();

        return _mapper.Map<SavedRecipeDto>(savedRecipe);
    }

    public async Task<bool> RemoveSavedRecipeAsync(Guid recipeId, Guid userId)
    {
        var savedRecipe = await _context.SavedRecipes
            .FirstOrDefaultAsync(sr => sr.RecipeId == recipeId && sr.UserId == userId);

        if (savedRecipe == null)
        {
            return false;
        }

        _context.SavedRecipes.Remove(savedRecipe);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsRecipeSavedAsync(Guid recipeId, Guid userId)
    {
        return await _context.SavedRecipes
            .AnyAsync(sr => sr.RecipeId == recipeId && sr.UserId == userId);
    }
}