using AutoMapper;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AdiCohenFit;

[MetadataType(typeof(WorkshopDto))]
public partial class Workshop
{
    [Required(ErrorMessage = "Missing workshop Image.")]
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

public class WorkshopDto
{
    public Guid? Id { get; set; }


    [Required(ErrorMessage = "The WorkshopName field is required.")]
    public string WorkshopName { get; set; } = null!;

    [Required(ErrorMessage = "The WorkshopDescription field is required.")]
    public string WorkshopDescription { get; set; } = null!;

    public decimal WorkshopPrice { get; set; }
    public int WorkshopPlacesLeft { get; set; }

    public DateTime WorkshopDate { get; set; }

    public string ImageName { get; set; } = null!;
    public string PaymentLink { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();

    [NotMapped]
    [JsonIgnore]
    public IFormFile? Image { get; set; }
}

public class WorkshopProfile : Profile
{
    public WorkshopProfile()
    {
        // Entity -> DTO
        CreateMap<Workshop, WorkshopDto>()
            .ForMember(dest => dest.Id,
                opt => opt.MapFrom(src => src.Id != Guid.Empty ? src.Id : Guid.NewGuid()))
            .ForMember(dest => dest.WorkshopName, opt => opt.MapFrom(src => src.WorkshopName))
            .ForMember(dest => dest.WorkshopDescription, opt => opt.MapFrom(src => src.WorkshopDescription))
            .ForMember(dest => dest.WorkshopPrice, opt => opt.MapFrom(src => src.WorkshopPrice))
            .ForMember(dest => dest.WorkshopPlacesLeft, opt => opt.MapFrom(src => src.WorkshopPlacesLeft))
            .ForMember(dest => dest.WorkshopDate, opt => opt.MapFrom(src => src.WorkshopDate))
            .ForMember(dest => dest.ImageName, opt => opt.MapFrom(src => src.ImageName))
            .ForMember(dest => dest.PaymentLink, opt => opt.MapFrom(src => src.PaymentLink))

            .ForMember(dest => dest.Image, opt => opt.Ignore());

        // DTO -> Entity
        CreateMap<WorkshopDto, Workshop>()
            .ForMember(dest => dest.WorkshopName, opt => opt.MapFrom(src => src.WorkshopName))
            .ForMember(dest => dest.WorkshopDescription, opt => opt.MapFrom(src => src.WorkshopDescription))
            .ForMember(dest => dest.WorkshopPrice, opt => opt.MapFrom(src => src.WorkshopPrice))
            .ForMember(dest => dest.WorkshopPlacesLeft, opt => opt.MapFrom(src => src.WorkshopPlacesLeft))
            .ForMember(dest => dest.WorkshopDate, opt => opt.MapFrom(src => src.WorkshopDate))
            .ForMember(dest => dest.ImageName, opt => opt.MapFrom(src => src.ImageName))
            .ForMember(dest => dest.PaymentLink, opt => opt.MapFrom(src => src.PaymentLink))
            .ForMember(dest => dest.Users, opt => opt.MapFrom(src => src.Users))
            .ForMember(dest => dest.Image, opt => opt.Ignore()) // Ignore non-mapped property
            .ForMember(dest => dest.ImageUrl, opt => opt.Ignore()); // Optional: avoid issues with computed property
    }
}
