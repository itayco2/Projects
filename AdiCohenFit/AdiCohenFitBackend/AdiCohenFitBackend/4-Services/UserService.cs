﻿using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AdiCohenFit;

// Service class for managing users
public class UserService : IDisposable
{
    private readonly WebsiteContext _db;
    private readonly IMapper _mapper;

    // Enum representing different role types
    public enum RoleType
    {
        Visitor = 1,
        Admin = 2
    }

    // Constructor that accepts UniversityContext and IMapper instances
    public UserService(WebsiteContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    // Registers a new user asynchronously
    public async Task<string> Register(RegisterCredentials credentials)
    {
        ValidationContext validationContext = new ValidationContext(credentials);
        Validator.ValidateObject(credentials, validationContext, validateAllProperties: true);

        credentials.Email = credentials.Email.ToLowerInvariant();

        if (await IsEmailTaken(credentials.Email))
        {
            throw new InvalidOperationException("האימייל קיים כבר במערכת נסה שנית עם אימייל אחר");
        }

        // Automatically assign Visitor role
        int visitorRoleId = (int)RoleType.Visitor;
        Role? role = await _db.Roles.FindAsync(visitorRoleId);
        if (role == null)
        {
            throw new InvalidOperationException("Visitor role does not exist in the database.");
        }

        User user = new User
        {
            Name = credentials.Name,
            Email = credentials.Email,
            Password = Cyber.HashPassword(credentials.Password),
            RoleId = visitorRoleId,
            Phone = credentials.Phone
        };

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        return JwtHelper.GetNewToken(user);
    }


    // Logs in a user asynchronously
    public async Task<string?> Login(Credentials credentials)
    {
        // Validate the credentials
        ValidationContext validationContext = new ValidationContext(credentials);
        Validator.ValidateObject(credentials, validationContext, validateAllProperties: true);

        credentials.Email = credentials.Email.ToLowerInvariant();
        string hashedPassword = Cyber.HashPassword(credentials.Password);

        User? user = await _db.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .SingleOrDefaultAsync(u =>
                u.Email == credentials.Email &&
                u.Password == hashedPassword);

        if (user == null)
        {
            return null;
        }

        return JwtHelper.GetNewToken(user);
    }

    // Retrieves a single user by their ID asynchronously
    public async Task<UserDto?> GetOneUser(Guid id)
    {
        return await _db.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .ProjectTo<UserDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    // Checks if an email is already taken
    public async Task<bool> IsEmailTaken(string email)
    {
        return await _db.Users.AnyAsync(u => u.Email == email.ToLowerInvariant());
    }

    // Disposes the database context
    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }
}

// AutoMapper profile for mapping between User and UserDto
public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Password, opt => opt.Ignore())
            .ReverseMap()
            .ForMember(dest => dest.Password, opt => opt.Ignore());
    }
}
