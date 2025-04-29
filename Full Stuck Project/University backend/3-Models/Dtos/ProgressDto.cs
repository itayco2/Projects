using AutoMapper;

namespace University_backend;

public class ProgressDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public DateTime? WatchedAt { get; set; }
}


public class ProgressProfile : Profile
{
    public ProgressProfile()
    {
        // Mapping configuration from Course to CourseDto
        CreateMap<Progress, ProgressDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.LessonId, opt => opt.MapFrom(src => src.LessonId))
            .ForMember(dest => dest.WatchedAt, opt => opt.MapFrom(src => src.WatchedAt))
            .ReverseMap();
    }
}