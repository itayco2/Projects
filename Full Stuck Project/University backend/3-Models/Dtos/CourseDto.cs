using AutoMapper;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace University_backend;

public class CourseDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}


public class CourseProfile : Profile
{
    public CourseProfile()
    {
        // Mapping configuration from Course to CourseDto
        CreateMap<Course, CourseDto>()
            .ForMember(dest => dest.Id,
                opt => opt.MapFrom(src => src.Id != Guid.Empty ? src.Id : Guid.NewGuid()))
            .ForMember(dest => dest.CreatedAt,
                opt => opt.MapFrom(src => src.CreatedAt != default ? src.CreatedAt : DateTime.Now))
            .ReverseMap()
            .ForMember(dest => dest.Id,
                opt => opt.MapFrom(src => src.Id != Guid.Empty ? src.Id : Guid.NewGuid()));
    }
}