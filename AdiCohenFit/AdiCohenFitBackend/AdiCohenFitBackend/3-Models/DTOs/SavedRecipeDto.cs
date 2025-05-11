using AdiCohenFit;
using AutoMapper;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AdiCohenFIt;
    public class SavedRecipeDto
    {
        public Guid? Id { get; set; }
        public Guid UserId { get; set; }
        public Guid RecipeId { get; set; }
        public DateTime SavedAt { get; set; }

        // Recipe details for display
        public string RecipeName { get; set; } = null!;
        public string RecipeDescription { get; set; } = null!;
        public string ImageName { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public int PrepTimeMinutes { get; set; }
        public int CookTimeMinutes { get; set; }
        public int Servings { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
    }

    // Request DTO for saving a recipe
    public class SaveRecipeRequestDto
    {
        [Required(ErrorMessage = "Recipe ID is required")]
        public Guid RecipeId { get; set; }
    }

// AutoMapper Profile for SavedRecipe
public class SavedRecipeProfile : Profile
{
    public SavedRecipeProfile()
    {
        // Entity -> DTO
        CreateMap<AdiCohenFIt.SavedRecipe, SavedRecipeDto>()
            .ForMember(dest => dest.Id,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.UserId,
                opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.RecipeId,
                opt => opt.MapFrom(src => src.RecipeId))
            .ForMember(dest => dest.SavedAt,
                opt => opt.MapFrom(src => src.SavedAt))
            .ForMember(dest => dest.RecipeName,
                opt => opt.MapFrom(src => src.Recipe.RecipeName))
            .ForMember(dest => dest.RecipeDescription,
                opt => opt.MapFrom(src => src.Recipe.RecipeDescription))
            .ForMember(dest => dest.ImageName,
                opt => opt.MapFrom(src => src.Recipe.ImageName))
            .ForMember(dest => dest.ImageUrl,
                opt => opt.MapFrom(src => src.Recipe.ImageUrl))
            .ForMember(dest => dest.PrepTimeMinutes,
                opt => opt.MapFrom(src => src.Recipe.PrepTimeMinutes))
            .ForMember(dest => dest.CookTimeMinutes,
                opt => opt.MapFrom(src => src.Recipe.CookTimeMinutes))
            .ForMember(dest => dest.Servings,
                opt => opt.MapFrom(src => src.Recipe.Servings))
            .ForMember(dest => dest.CategoryId,
                opt => opt.MapFrom(src => src.Recipe.CategoryId))
            .ForMember(dest => dest.CategoryName,
                opt => opt.MapFrom(src => src.Recipe.Category.CategoryName));

        // DTO -> Entity (for create operations)
        CreateMap<SaveRecipeRequestDto, AdiCohenFIt.SavedRecipe>()
            .ForMember(dest => dest.RecipeId,
                opt => opt.MapFrom(src => src.RecipeId))
            .ForMember(dest => dest.UserId,
                opt => opt.Ignore()) // Set in controller
            .ForMember(dest => dest.Id,
                opt => opt.Ignore()) // Generated
            .ForMember(dest => dest.SavedAt,
                opt => opt.Ignore()) // Set default in entity
            .ForMember(dest => dest.User,
                opt => opt.Ignore()) // Navigation property
            .ForMember(dest => dest.Recipe,
                opt => opt.Ignore()); // Navigation property
    }
}
    