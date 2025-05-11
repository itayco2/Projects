using AutoMapper;
using System.ComponentModel.DataAnnotations;

namespace AdiCohenFit;

public class RecipeCategoryDto
{
    public Guid? Id { get; set; }

    [Required(ErrorMessage = "The CategoryName field is required.")]
    [StringLength(50, ErrorMessage = "CategoryName must be at most 50 characters.")]
    public string CategoryName { get; set; } = null!;

    [StringLength(200, ErrorMessage = "CategoryDescription must be at most 200 characters.")]
    public string? CategoryDescription { get; set; }

    // Optional: Include count of recipes in this category
    public int RecipeCount { get; set; }
}

public class RecipeCategoryProfile : Profile
{
    public RecipeCategoryProfile()
    {
        // Entity -> DTO
        CreateMap<RecipeCategory, RecipeCategoryDto>()
            .ForMember(dest => dest.Id,
                opt => opt.MapFrom(src => src.Id != Guid.Empty ? src.Id : Guid.NewGuid()))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.CategoryName))
            .ForMember(dest => dest.CategoryDescription, opt => opt.MapFrom(src => src.CategoryDescription))
            .ForMember(dest => dest.RecipeCount, opt => opt.MapFrom(src => src.Recipes.Count));

        // DTO -> Entity
        CreateMap<RecipeCategoryDto, RecipeCategory>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.CategoryName))
            .ForMember(dest => dest.CategoryDescription, opt => opt.MapFrom(src => src.CategoryDescription))
            .ForMember(dest => dest.Recipes, opt => opt.Ignore());
    }
}