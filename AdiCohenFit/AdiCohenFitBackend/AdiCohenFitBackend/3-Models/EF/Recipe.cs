using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AdiCohenFit;

[Table("Recipe")]
public partial class Recipe
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    public string RecipeName { get; set; } = null!;

    public string RecipeDescription { get; set; } = null!;

    public string Ingredients { get; set; } = null!;

    public string Instructions { get; set; } = null!;

    public int PrepTimeMinutes { get; set; }

    public int CookTimeMinutes { get; set; }

    public int Servings { get; set; }

    public string ImageName { get; set; } = null!;

    public Guid CategoryId { get; set; }

    [ForeignKey("CategoryId")]
    public virtual RecipeCategory Category { get; set; } = null!;
}