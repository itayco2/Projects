using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace AdiCohenFit;

public interface IRecipeService
{
    Task<List<RecipeDto>> GetAllRecipesAsync();
    Task<List<RecipeDto>> GetRecipesByCategoryAsync(Guid categoryId);
    Task<RecipeDto?> GetRecipeByIdAsync(Guid id);
    Task<RecipeDto> AddRecipeAsync(RecipeDto recipeDto);
    Task<RecipeDto?> UpdateRecipeAsync(RecipeDto recipeDto);
    Task<bool> DeleteRecipeAsync(Guid id);
    Task<string> SaveImageAsync(IFormFile image);
}

public class RecipeService : IRecipeService
{
    private readonly WebsiteContext _context;
    private readonly IMapper _mapper;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public RecipeService(WebsiteContext context, IMapper mapper, IWebHostEnvironment webHostEnvironment)
    {
        _context = context;
        _mapper = mapper;
        _webHostEnvironment = webHostEnvironment;
    }

    public async Task<List<RecipeDto>> GetAllRecipesAsync()
    {
        var recipes = await _context.Recipes
            .Include(r => r.Category)
            .ToListAsync();

        return _mapper.Map<List<RecipeDto>>(recipes);
    }

    public async Task<List<RecipeDto>> GetRecipesByCategoryAsync(Guid categoryId)
    {
        var recipes = await _context.Recipes
            .Include(r => r.Category)
            .Where(r => r.CategoryId == categoryId)
            .ToListAsync();

        return _mapper.Map<List<RecipeDto>>(recipes);
    }

    public async Task<RecipeDto?> GetRecipeByIdAsync(Guid id)
    {
        var recipe = await _context.Recipes
            .Include(r => r.Category)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
            return null;

        return _mapper.Map<RecipeDto>(recipe);
    }

    public async Task<RecipeDto> AddRecipeAsync(RecipeDto recipeDto)
    {
        if (recipeDto.Image != null)
        {
            recipeDto.ImageName = await SaveImageAsync(recipeDto.Image);
        }

        var recipe = _mapper.Map<Recipe>(recipeDto);

        _context.Recipes.Add(recipe);
        await _context.SaveChangesAsync();

        // Reload the recipe with its category to properly map back to DTO
        var savedRecipe = await _context.Recipes
            .Include(r => r.Category)
            .FirstOrDefaultAsync(r => r.Id == recipe.Id);

        return _mapper.Map<RecipeDto>(savedRecipe);
    }

    public async Task<RecipeDto?> UpdateRecipeAsync(RecipeDto recipeDto)
    {
        var existingRecipe = await _context.Recipes.FindAsync(recipeDto.Id);

        if (existingRecipe == null)
            return null;

        // Handle image update
        if (recipeDto.Image != null)
        {
            // Delete old image if it exists
            if (!string.IsNullOrEmpty(existingRecipe.ImageName))
            {
                var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, "images", existingRecipe.ImageName);
                if (File.Exists(oldImagePath))
                {
                    File.Delete(oldImagePath);
                }
            }

            recipeDto.ImageName = await SaveImageAsync(recipeDto.Image);
        }
        else
        {
            // Preserve existing image if no new one is provided
            recipeDto.ImageName = existingRecipe.ImageName;
        }

        // Update entity
        _mapper.Map(recipeDto, existingRecipe);

        _context.Recipes.Update(existingRecipe);
        await _context.SaveChangesAsync();

        // Reload the recipe with its category
        var updatedRecipe = await _context.Recipes
            .Include(r => r.Category)
            .FirstOrDefaultAsync(r => r.Id == existingRecipe.Id);

        return _mapper.Map<RecipeDto>(updatedRecipe);
    }

    public async Task<bool> DeleteRecipeAsync(Guid id)
    {
        var recipe = await _context.Recipes.FindAsync(id);

        if (recipe == null)
            return false;

        // Delete image file
        if (!string.IsNullOrEmpty(recipe.ImageName))
        {
            var imagePath = Path.Combine(_webHostEnvironment.WebRootPath, "images", recipe.ImageName);
            if (File.Exists(imagePath))
            {
                File.Delete(imagePath);
            }
        }

        _context.Recipes.Remove(recipe);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<string> SaveImageAsync(IFormFile image)
    {
        // Generate unique filename
        var uniqueFileName = Guid.NewGuid().ToString() + "_" + image.FileName;

        // Ensure the directory exists
        var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // Save the file
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(fileStream);
        }

        return uniqueFileName;
    }
}