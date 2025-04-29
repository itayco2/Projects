using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using University_backend;

namespace University_backend;

public static class JwtHelper
{
    // JWT token handler for creating and validating tokens
    private static readonly JwtSecurityTokenHandler _handler = new JwtSecurityTokenHandler();

    // Symmetric security key used for signing the JWT tokens
    private static readonly SymmetricSecurityKey _symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(AppConfig.JwtKey)); // Must be minimum 16 char string.

    // Generates a new JWT token for a given user
    public static string GetNewToken(User user)
    {
        // Create a dictionary to hold user information
        Dictionary<string, object> userObject = new Dictionary<string, object>
            {
                { "id", user.Id.ToString() },
                { "name", user.Name },
                { "email", user.Email },
                { "role", user.Role.RoleName }
            };

        List<Claim> claims = new List<Claim> {
                new Claim(ClaimTypes.Role, user.Role.RoleName)
            };

        // Create the security token descriptor
        SecurityTokenDescriptor descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(AppConfig.JwtExpireHours),
            SigningCredentials = new SigningCredentials(_symmetricSecurityKey, SecurityAlgorithms.HmacSha512),
            Claims = new Dictionary<string, object>
                {
                    { "user", userObject }
                }
        };

        // Create the token
        SecurityToken securityToken = _handler.CreateToken(descriptor);

        // Write the token to a string
        string token = _handler.WriteToken(securityToken);

        return token;
    }

    // Sets the default options for JWT bearer authentication
    public static void SetBearerOptions(JwtBearerOptions options)
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, 
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _symmetricSecurityKey
        };
    }
}
