using Microsoft.EntityFrameworkCore;

namespace University_backend;

public class UniversityContext : DbContext
{
    // Constructor that accepts DbContextOptions and passes them to the base class
    public UniversityContext(DbContextOptions<UniversityContext> options) : base(options) { }

    // DbSet properties for each entity in the database
    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }
    public DbSet<Progress> Progress { get; set; }

    // Configures the model and relationships between entities
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Progress>()
            .HasOne(p => p.User)
            .WithMany(u => u.ProgressRecords)
            .HasForeignKey(p => p.UserId);

        modelBuilder.Entity<Progress>()
            .HasOne(p => p.Lesson)
            .WithMany(l => l.ProgressRecords)
            .HasForeignKey(p => p.LessonId);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.User)
            .WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.UserId);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId);

        modelBuilder.Entity<Role>()
            .HasMany(r => r.Users)
            .WithOne(u => u.Role)
            .HasForeignKey(u => u.RoleId);

        // Seed initial data for the Role entity
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Student" },
            new Role { RoleId = 2, RoleName = "Professor" },
            new Role { RoleId = 3, RoleName = "Admin" }
        );

        base.OnModelCreating(modelBuilder);
    }
}
