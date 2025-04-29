using AutoMapper;
using System;
using System.ComponentModel.DataAnnotations;

namespace University_backend;

public class UserDto
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Invalid Email Address")]
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public int RoleId { get; set; }

    public string RoleName { get; set; } = string.Empty;
}


// AutoMapper profile for mapping between User and UserDto
public class UserProfileMapping : Profile
{
    public UserProfileMapping()
    {
        // Mapping configuration from User to UserDto
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src =>
                string.IsNullOrWhiteSpace(src.Name) ? string.Empty : src.Name))
            .ForMember(dest => dest.Password, opt => opt.Ignore()) // Ignore Password during mapping
            .ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.RoleId))
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.RoleName))
            .AfterMap((src, dest) =>
            {
                if (string.IsNullOrWhiteSpace(dest.Name) && !string.IsNullOrEmpty(src.Email))
                    dest.Name = src.Email.Split('@')[0];
                
            });

        // Mapping configuration from UserDto to User
        CreateMap<UserDto, User>()
            .ForMember(dest => dest.Password, opt => opt.Ignore()) // Ignore Password during mapping
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src =>
                string.IsNullOrWhiteSpace(src.Name) ? string.Empty : src.Name))
            .ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.RoleId))
            .AfterMap((src, dest) =>
            {
                if (string.IsNullOrWhiteSpace(dest.Name) && !string.IsNullOrEmpty(src.Email))
                    dest.Name = src.Email.Split('@')[0];
                
            });
    }
}
