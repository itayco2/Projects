using Microsoft.EntityFrameworkCore;

namespace AdiCohenFit;

public class WebsiteContext : DbContext
{

    public WebsiteContext(DbContextOptions<WebsiteContext> options) : base(options) {}


    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public virtual DbSet<Workshop> Workshops { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>()
        .HasMany(r => r.Users)
            .WithOne(u => u.Role)
            .HasForeignKey(u => u.RoleId);

        // Seed initial data for the Role entity
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Visitor" },
            new Role { RoleId = 2, RoleName = "Admin" }
        );

        base.OnModelCreating(modelBuilder);
    }

}
