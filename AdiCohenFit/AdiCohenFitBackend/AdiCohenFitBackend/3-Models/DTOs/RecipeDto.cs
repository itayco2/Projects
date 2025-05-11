using AutoMapper;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AdiCohenFit;

[MetadataType(typeof(RecipeDto))]
public partial class Recipe
{
    [Required(ErrorMessage = "Missing recipe Image.")]
    [JsonIgnore]
    [NotMapped]
    public IFormFile Image { get; set; } = null!;

    [NotMapped]
    public string? ImageUrl
    {
        get
        {
            return ImageName == null ? null : AppConfig.ImageUrl + ImageName;
        }
    }
}

public class RecipeDto
{
    public Guid? Id { get; set; }

    [Required(ErrorMessage = "The RecipeName field is required.")]
    public string RecipeName { get; set; } = null!;

    [Required(ErrorMessage = "The RecipeDescription field is required.")]
    public string RecipeDescription { get; set; } = null!;

    [Required(ErrorMessage = "Ingredients are required.")]
    public string Ingredients { get; set; } = null!;

    [Required(ErrorMessage = "Instructions are required.")]
    public string Instructions { get; set; } = null!;

    public int PrepTimeMinutes { get; set; }

    public int CookTimeMinutes { get; set; }

    public int Servings { get; set; }

    public string ImageName { get; set; } = null!;

    [Required(ErrorMessage = "Category is required.")]
    public Guid CategoryId { get; set; }

    // For display purposes in UI
    public string CategoryName { get; set; } = null!;

    [NotMapped]
    [JsonIgnore]
    public IFormFile? Image { get; set; }
}

public class RecipeProfile : Profile
{
    public RecipeProfile()
    {
        // Entity -> DTO
        CreateMap<Recipe, RecipeDto>()
            .ForMember(dest => dest.Id,
                opt => opt.MapFrom(src => src.Id != Guid.Empty ? src.Id : Guid.NewGuid()))
            .ForMember(dest => dest.RecipeName, opt => opt.MapFrom(src => src.RecipeName))
            .ForMember(dest => dest.RecipeDescription, opt => opt.MapFrom(src => src.RecipeDescription))
            .ForMember(dest => dest.Ingredients, opt => opt.MapFrom(src => src.Ingredients))
            .ForMember(dest => dest.Instructions, opt => opt.MapFrom(src => src.Instructions))
            .ForMember(dest => dest.PrepTimeMinutes, opt => opt.MapFrom(src => src.PrepTimeMinutes))
            .ForMember(dest => dest.CookTimeMinutes, opt => opt.MapFrom(src => src.CookTimeMinutes))
            .ForMember(dest => dest.Servings, opt => opt.MapFrom(src => src.Servings))
            .ForMember(dest => dest.ImageName, opt => opt.MapFrom(src => src.ImageName))
            .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.CategoryName))
            .ForMember(dest => dest.Image, opt => opt.Ignore());

        // DTO -> Entity
        CreateMap<RecipeDto, Recipe>()
            .ForMember(dest => dest.RecipeName, opt => opt.MapFrom(src => src.RecipeName))
            .ForMember(dest => dest.RecipeDescription, opt => opt.MapFrom(src => src.RecipeDescription))
            .ForMember(dest => dest.Ingredients, opt => opt.MapFrom(src => src.Ingredients))
            .ForMember(dest => dest.Instructions, opt => opt.MapFrom(src => src.Instructions))
            .ForMember(dest => dest.PrepTimeMinutes, opt => opt.MapFrom(src => src.PrepTimeMinutes))
            .ForMember(dest => dest.CookTimeMinutes, opt => opt.MapFrom(src => src.CookTimeMinutes))
            .ForMember(dest => dest.Servings, opt => opt.MapFrom(src => src.Servings))
            .ForMember(dest => dest.ImageName, opt => opt.MapFrom(src => src.ImageName))
            .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
            .ForMember(dest => dest.Image, opt => opt.Ignore())
            .ForMember(dest => dest.ImageUrl, opt => opt.Ignore()) // Avoid issues with computed property
            .ForMember(dest => dest.Category, opt => opt.Ignore()); // Handled by EF Core
    }
}