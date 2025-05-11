using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.Extensions.FileProviders;
using AdiCohenFit.Services;
using AdiCohenFIt;

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

            // Rate limiting setup
            builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
            builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>(); // Rate limit configuration
            builder.Services.AddInMemoryRateLimiting(); // In-memory rate limiting storage

            // Register services for Dependency Injection (DI)
            builder.Services.AddScoped<UserService>();
            builder.Services.AddScoped<WorkshopService>();
            builder.Services.AddScoped<CatchAllFilter>();

            // Register Recipe Services
            builder.Services.AddScoped<IRecipeService, RecipeService>();
            builder.Services.AddScoped<IRecipeCategoryService, RecipeCategoryService>();

            // Register SavedRecipe Service
            builder.Services.AddScoped<ISavedRecipeService, SavedRecipeService>();

            // Register FluentValidation validators
            builder.Services.AddScoped<IValidator<RecipeDto>, RecipeDtoValidator>();
            builder.Services.AddScoped<IValidator<RecipeCategoryDto>, RecipeCategoryDtoValidator>();
            builder.Services.AddScoped<IValidator<WorkshopDto>, WorkshopDtoValidator>();
            builder.Services.AddScoped<IValidator<SaveRecipeRequestDto>, SaveRecipeDtoValidator>();

            // Add FluentValidation auto-validation
            builder.Services.AddFluentValidationAutoValidation();

            // Register AutoMapper profiles
            builder.Services.AddAutoMapper(typeof(Program),
                                          typeof(RecipeProfile),
                                          typeof(RecipeCategoryProfile),
                                          typeof(WorkshopProfile),
                                          typeof(SavedRecipeProfile));

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

            // Ensure assets directory exists
            string assetsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets");
            if (!Directory.Exists(assetsPath))
            {
                Directory.CreateDirectory(assetsPath);
            }

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(assetsPath),
                RequestPath = "/assets"
            });

            // Ensure images directory exists and add it for recipe images
            string imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            if (!Directory.Exists(imagesPath))
            {
                Directory.CreateDirectory(imagesPath);
            }

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(imagesPath),
                RequestPath = "/images"
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