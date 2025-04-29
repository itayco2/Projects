using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace University_backend;

public class Enrollment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required(ErrorMessage = "Missing user id")]
    public Guid UserId { get; set; }

    // Navigation property for the User entity
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    // Foreign key for the Course entity
    [Required(ErrorMessage = "Missing course id")]
    public Guid CourseId { get; set; }

    // Navigation property for the Course entity
    [ForeignKey("CourseId")]
    public virtual Course Course { get; set; } = null!;

    // Date and time when the enrollment was created
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime EnrolledAt { get; set; } = DateTime.Now;
}
