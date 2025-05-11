using AdiCohenFit;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AdiCohenFIt;

[Table("SavedRecipes")]
public class SavedRecipe
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    // Foreign key for User
    [Required]
    public Guid UserId { get; set; }

    // Foreign key for Recipe
    [Required]
    public Guid RecipeId { get; set; }

    // When the recipe was saved
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("RecipeId")]
    public virtual Recipe Recipe { get; set; } = null!;
}

