using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models; // For Swagger
using System.Text.Json.Serialization;

namespace University_backend;

public class Program
{
    public static void Main(string[] args)
    {
        // Building app:
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        AppConfig.Configure(builder.Environment);

        // Configure database connection
        string? connectionString = builder.Configuration.GetConnectionString("UniversityDB");
        builder.Services.AddDbContext<UniversityContext>(options => options.UseSqlServer(connectionString));

        // Rate limiting:
        builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("RateLimit")); // Configuration from appsettings.json
        builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>(); // Create rate limit object.
        builder.Services.AddInMemoryRateLimiting(); // Save rate limit calculations in memory

        // Register services for DI (Dependency Injection)
        builder.Services.AddScoped<UserService>();
        builder.Services.AddScoped<LessonService>();
        builder.Services.AddScoped<CourseService>();
        builder.Services.AddScoped<EnrollmentService>();
        builder.Services.AddScoped<ProgressService>();
        builder.Services.AddScoped<CatchAllFilter>();
        builder.Services.AddAutoMapper(typeof(Program));

        // Add MVC and global error handling filter
        builder.Services.AddMvc(options => options.Filters.Add<CatchAllFilter>());
        builder.Services.Configure<ApiBehaviorOptions>(options => options.SuppressModelStateInvalidFilter = true); // Don't check validation errors using built-in filter

        // Add JWT authentication
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                JwtHelper.SetBearerOptions(options);
            });

        // Add controllers and configure JSON options (for reference handling and null values)
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            });

        // Add Swagger for API documentation (optional)
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "University API",
                Version = "v1",
                Description = "API for managing users, courses, and lessons in a University system."
            });
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter a valid token",
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] { }
                    }
            });
        });

        // Build the app
        WebApplication app = builder.Build();

        // Enable CORS to allow requests from the Angular frontend (adjust as needed)
        app.UseCors(policy =>
            policy.WithOrigins("http://localhost:4200") // Update the Angular URL if hosted on a different port
                .AllowAnyHeader()
                .AllowAnyMethod()
        );

        // Middleware setup
        app.UseIpRateLimiting(); // Apply rate limiting middleware
        app.UseAuthentication();  // Use JWT Authentication
        app.UseAuthorization();   // Authorization middleware

        // Swagger UI (optional, for API documentation)
        if (builder.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "University API v1"));
        }

        // Map Controllers to routes
        app.MapControllers();

        // Run the application
        app.Run();
    }
}
