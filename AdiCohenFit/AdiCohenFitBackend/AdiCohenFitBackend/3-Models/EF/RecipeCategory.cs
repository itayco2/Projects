using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AdiCohenFit;

[Table("RecipeCategory")]
public class RecipeCategory
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(50)]
    public string CategoryName { get; set; } = null!;

    [StringLength(200)]
    public string? CategoryDescription { get; set; }

    public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
}