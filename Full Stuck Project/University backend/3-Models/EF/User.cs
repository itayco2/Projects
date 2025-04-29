using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using University_backend;
using System.Text.Json.Serialization;

public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required(ErrorMessage = "Missing name")]
    [MaxLength(50)]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Missing Email")]
    [EmailAddress(ErrorMessage = "Invalid Email Address")]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Missing password")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    [MaxLength(500)]
    public string Password { get; set; } = string.Empty;

    // Foreign key for the Role entity
    [Column("RoleID")]
    public int RoleId { get; set; }

    // Navigation property for the Role entity
    [InverseProperty("Users")]
    [JsonIgnore]
    public virtual Role Role { get; set; } = null!;

    // Collection of enrollments associated with the user
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    // Collection of progress records associated with the user
    public virtual ICollection<Progress> ProgressRecords { get; set; } = new List<Progress>();
}
