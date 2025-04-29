using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AdiCohenFit;

public class Role
{
    [Key]
    [Column("RoleID")]
    public int RoleId { get; set; }

    [StringLength(20)]
    public string RoleName { get; set; } = null!;

    // Collection of users associated with the role
    [InverseProperty("Role")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}



