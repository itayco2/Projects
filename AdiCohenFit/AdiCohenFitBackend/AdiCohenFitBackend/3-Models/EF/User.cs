using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;
using System.Text.Json.Serialization;

namespace AdiCohenFit;

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

    [Required(ErrorMessage = "Missing phone")]
    [MinLength(10, ErrorMessage = "Phone must be 10 characters long.")]
    [MaxLength(10)]
    public string Phone { get; set; } = string.Empty;

    // Foreign key for the Role entity
    [Column("RoleID")]
    public int RoleId { get; set; }

    // Navigation property for the Role entity
    [InverseProperty("Users")]
    [JsonIgnore]
    public virtual Role Role { get; set; } = null!;


}
