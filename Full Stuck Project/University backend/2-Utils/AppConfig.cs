namespace University_backend;

static class AppConfig
{
    // Indicates if the application is running in development mode
    public static bool IsDevelopment { get; private set; }

    // Indicates if the application is running in production mode
    public static bool IsProduction { get; private set; }

    public static string ConnectionString { get; private set; } = null!;
    public static string HostUrl { get; private set; } = null!;

    // Secret key used for JWT token generation
    public static string JwtKey { get; private set; } = "משהו רנדומלי#@$#%!#%!#$משהו רנדומלי#@$#%!#%!#$משהו רנדומלי#@$#%!#%!#$משהו רנדומלי#@$#%!#%!#$משהו רנדומלי#@$#%!#%!#$משהו רנדומלי#@$#%!#%!#$";

    // Expiration time for JWT tokens in hours
    public static int JwtExpireHours { get; private set; }

    // Configures the application settings based on the environment
    public static void Configure(IWebHostEnvironment env)
    {
        // Set the environment flags
        IsDevelopment = env.IsDevelopment();
        IsProduction = env.IsProduction();

        // Build the configuration from appsettings.json and environment-specific appsettings file
        IConfigurationRoot settings = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json")
            .AddJsonFile($"appsettings.{env.EnvironmentName}.json")
            .Build();

        ConnectionString = settings.GetConnectionString("UniversityDB")!;

        // Retrieve the host URL from the environment variables
        HostUrl = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")!;

        // Set the JWT token expiration time based on the environment
        JwtExpireHours = IsDevelopment ? 5 : 1;
    }
}
