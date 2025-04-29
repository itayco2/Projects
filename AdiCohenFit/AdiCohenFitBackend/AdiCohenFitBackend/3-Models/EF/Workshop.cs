using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AdiCohenFit;

[Table("Workshop")]
public partial class Workshop
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    public string WorkshopName { get; set; } = null!;

    public string WorkshopDescription { get; set; } = null!;

    [Column(TypeName = "money")]
    public decimal WorkshopPrice { get; set; }

    public int WorkshopPlacesLeft { get; set; }

    public DateTime WorkshopDate { get; set; }


    public string ImageName { get; set; } = null!;
    
    public string PaymentLink { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();

}
