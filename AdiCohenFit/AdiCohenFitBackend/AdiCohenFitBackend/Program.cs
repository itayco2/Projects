using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.Extensions.FileProviders;

namespace AdiCohenFit
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Building app:
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
            AppConfig.Configure(builder.Environment);

            // Register IMemoryCache
            builder.Services.AddMemoryCache(); // Add this line for caching

            // Configure database connection
            string? connectionString = builder.Configuration.GetConnectionString("AdiCohenFit");
            builder.Services.AddDbContext<WebsiteContext>(options => options.UseSqlServer(connectionString));
            builder.Services.AddControllers();

            // Rate limiting setup
            builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
            builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>(); // Rate limit configuration
            builder.Services.AddInMemoryRateLimiting(); // In-memory rate limiting storage

            // Register services for Dependency Injection (DI)
            builder.Services.AddScoped<UserService>();
            builder.Services.AddScoped<WorkshopService>();
            builder.Services.AddScoped<CatchAllFilter>();
            builder.Services.AddAutoMapper(typeof(Program));

            // Add MVC and global error handling filter
            builder.Services.AddMvc(options => options.Filters.Add<CatchAllFilter>());
            builder.Services.Configure<ApiBehaviorOptions>(options => options.SuppressModelStateInvalidFilter = true); // Ignore validation errors using built-in filter

            // Add JWT Authentication
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    JwtHelper.SetBearerOptions(options); // JWT options setup
                });

            // Add controllers and configure JSON options (for reference handling and null values)
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles; // Handle reference cycles
                    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull; // Ignore null properties
                });

            // Build the application
            WebApplication app = builder.Build();

            // Configure CORS
            app.UseCors(policy =>
                policy.WithOrigins("http://localhost:4200")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
            );

            app.UseStaticFiles(); // Standard static files from wwwroot

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets")),
                RequestPath = "/assets"
            });

            // Middleware setup
            app.UseIpRateLimiting();
            app.UseAuthentication();
            app.UseAuthorization();

            // Map Controllers to routes
            app.MapControllers();

            // Run the application
            app.Run();
        }
    }
}
