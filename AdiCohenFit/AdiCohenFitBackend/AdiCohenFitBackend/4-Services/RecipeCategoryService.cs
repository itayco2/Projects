using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace AdiCohenFit;

public interface IRecipeCategoryService
{
    Task<List<RecipeCategoryDto>> GetAllCategoriesAsync();
    Task<RecipeCategoryDto?> GetCategoryByIdAsync(Guid id);
    Task<RecipeCategoryDto> AddCategoryAsync(RecipeCategoryDto categoryDto);
    Task<RecipeCategoryDto?> UpdateCategoryAsync(RecipeCategoryDto categoryDto);
    Task<bool> DeleteCategoryAsync(Guid id);
}

public class RecipeCategoryService : IRecipeCategoryService
{
    private readonly WebsiteContext _context;
    private readonly IMapper _mapper;

    public RecipeCategoryService(WebsiteContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<RecipeCategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _context.RecipeCategories
            .Include(c => c.Recipes)
            .ToListAsync();

        return _mapper.Map<List<RecipeCategoryDto>>(categories);
    }

    public async Task<RecipeCategoryDto?> GetCategoryByIdAsync(Guid id)
    {
        var category = await _context.RecipeCategories
            .Include(c => c.Recipes)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            return null;

        return _mapper.Map<RecipeCategoryDto>(category);
    }

    public async Task<RecipeCategoryDto> AddCategoryAsync(RecipeCategoryDto categoryDto)
    {
        var category = _mapper.Map<RecipeCategory>(categoryDto);

        _context.RecipeCategories.Add(category);
        await _context.SaveChangesAsync();

        var savedCategory = await _context.RecipeCategories
            .Include(c => c.Recipes)
            .FirstOrDefaultAsync(c => c.Id == category.Id);

        return _mapper.Map<RecipeCategoryDto>(savedCategory);
    }

    public async Task<RecipeCategoryDto?> UpdateCategoryAsync(RecipeCategoryDto categoryDto)
    {
        var existingCategory = await _context.RecipeCategories.FindAsync(categoryDto.Id);

        if (existingCategory == null)
            return null;

        _mapper.Map(categoryDto, existingCategory);

        _context.RecipeCategories.Update(existingCategory);
        await _context.SaveChangesAsync();

        var updatedCategory = await _context.RecipeCategories
            .Include(c => c.Recipes)
            .FirstOrDefaultAsync(c => c.Id == existingCategory.Id);

        return _mapper.Map<RecipeCategoryDto>(updatedCategory);
    }

    public async Task<bool> DeleteCategoryAsync(Guid id)
    {
        // First check if there are recipes associated with this category
        var hasRecipes = await _context.Recipes.AnyAsync(r => r.CategoryId == id);

        if (hasRecipes)
        {
            // You might want to decide what to do if a category has recipes
            // Option 1: Don't allow deletion
            return false;

            // Option 2: Delete all associated recipes (uncomment if you want this behavior)
            /*
            var recipesToDelete = await _context.Recipes.Where(r => r.CategoryId == id).ToListAsync();
            _context.Recipes.RemoveRange(recipesToDelete);
            */
        }

        var category = await _context.RecipeCategories.FindAsync(id);

        if (category == null)
            return false;

        _context.RecipeCategories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }
}