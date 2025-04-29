using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using AutoMapper;

namespace University_backend;

public class LessonDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public virtual Course? Course { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string VideoUrl { get; set; } = null!;

}


public class LessonProfile : Profile
{
    public LessonProfile()
    {
        // Mapping configuration from Course to CourseDto
        CreateMap<Lesson, LessonDto>()
            .ForMember(dest => dest.Id,
                opt => opt.MapFrom(src => src.Id != Guid.Empty ? src.Id : Guid.NewGuid()))
            .ForMember(dest => dest.CourseId,
                opt => opt.MapFrom(src => src.CourseId != Guid.Empty ? src.CourseId : Guid.Empty))
            .ForMember(dest => dest.Course,
                opt => opt.MapFrom(src => src.Course))
            .ReverseMap()
            .ForMember(dest => dest.Id,
                opt => opt.MapFrom(src => src.Id != Guid.Empty ? src.Id : Guid.NewGuid()));
    }
}