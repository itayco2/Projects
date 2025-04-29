using System.ComponentModel.DataAnnotations;

namespace University_backend;

// Class representing user credentials for login
public class Credentials
{
    [Required(ErrorMessage = "Missing Email.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = null!;
}

// Class representing user credentials for registration
public class RegisterCredentials
{
    [Required(ErrorMessage = "The Name field is required.")]
    [MaxLength(50)]
    public string Name { get; set; } = null!;

    [MinLength(2, ErrorMessage = "Email must be minimum 2 characters long.")]
    [MaxLength(100, ErrorMessage = "Email can't exceed 100 characters.")]
    [RegularExpression("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", ErrorMessage = "Invalid Email.")]
    public string Email { get; set; } = null!;

    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    [MaxLength(100, ErrorMessage = "Password can't exceed 100 characters.")]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$",
    ErrorMessage = "Password must contain at least one uppercase letter, one digit, and one special character.")]
    public string Password { get; set; } = null!;

    [Required(ErrorMessage = "Missing Role")]
    public int RoleId { get; set; }
}
