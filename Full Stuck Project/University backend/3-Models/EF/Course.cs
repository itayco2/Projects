using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace University_backend;

public class Course
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required(ErrorMessage = "Missing Title")]
    [MaxLength(100)]
    public string Title { get; set; } = null!;

    [Required(ErrorMessage = "Missing Description")]
    [MaxLength(1000)]
    public string Description { get; set; } = null!;

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Collection of lessons associated with the course
    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

    // Collection of enrollments associated with the course
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}
