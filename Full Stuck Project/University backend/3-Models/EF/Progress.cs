using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace University_backend;

public class Progress
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    // Foreign key for the User entity
    [Required(ErrorMessage = "Missing user id")]
    public Guid UserId { get; set; }

    // Navigation property for the User entity
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    // Foreign key for the Lesson entity
    [Required(ErrorMessage = "Missing lessonid")]
    public Guid LessonId { get; set; }

    // Navigation property for the Lesson entity
    [ForeignKey("LessonId")]
    public virtual Lesson Lesson { get; set; } = null!;

    public DateTime? WatchedAt { get; set; }
}
