using AutoMapper;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace University_backend;

public class EnrollmentDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public DateTime EnrolledAt { get; set; } = DateTime.Now;
    public double ProgressPercentage { get; set; }
}


public class EnrollmentProfile : Profile
{
    public EnrollmentProfile()
    {
        // Mapping configuration from Course to CourseDto
        CreateMap<Enrollment, EnrollmentDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id != Guid.Empty ? src.Id : Guid.NewGuid()))
            .ForMember(dest => dest.EnrolledAt, opt => opt.MapFrom(src => src.EnrolledAt != default ? src.EnrolledAt : DateTime.Now));

        CreateMap<EnrollmentDto, Enrollment>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id != Guid.Empty ? src.Id : Guid.NewGuid()))
            .ForMember(dest => dest.EnrolledAt, opt => opt.MapFrom(src => src.EnrolledAt != default ? src.EnrolledAt : DateTime.Now));
    }
}

