using AdiCohenFIt;
using Microsoft.EntityFrameworkCore;

namespace AdiCohenFit;

public class WebsiteContext : DbContext
{
    public WebsiteContext(DbContextOptions<WebsiteContext> options) : base(options) { }

    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public virtual DbSet<Workshop> Workshops { get; set; }
    public virtual DbSet<Recipe> Recipes { get; set; }
    public virtual DbSet<RecipeCategory> RecipeCategories { get; set; }
    public virtual DbSet<SavedRecipe> SavedRecipes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>()
            .HasMany(r => r.Users)
            .WithOne(u => u.Role)
            .HasForeignKey(u => u.RoleId);

        modelBuilder.Entity<RecipeCategory>()
            .HasMany(c => c.Recipes)
            .WithOne(r => r.Category)
            .HasForeignKey(r => r.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SavedRecipe>()
            .HasOne(sr => sr.User)
            .WithMany()
            .HasForeignKey(sr => sr.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SavedRecipe>()
            .HasOne(sr => sr.Recipe)
            .WithMany()
            .HasForeignKey(sr => sr.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed initial data for the Role entity
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Visitor" },
            new Role { RoleId = 2, RoleName = "Admin" }
        );
        base.OnModelCreating(modelBuilder);
    }
}