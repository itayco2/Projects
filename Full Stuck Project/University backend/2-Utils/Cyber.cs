using System.Security.Cryptography;
using System.Text;

namespace University_backend;

public static class Cyber
{
    // Hashes a plain text password using a salt and the SHA-512 algorithm
    public static string HashPassword(string plainText)
    {
        // Salt used for hashing
        string salt = "I made it with alot of thinking and im proud of it!";
        byte[] saltBytes = Encoding.UTF8.GetBytes(salt);

        // Create an instance of Rfc2898DeriveBytes with the plain text password, salt, iteration count, and hash algorithm
        Rfc2898DeriveBytes rfc = new Rfc2898DeriveBytes(plainText, saltBytes, 17, HashAlgorithmName.SHA512);

        // Generate the hash bytes
        byte[] hashBytes = rfc.GetBytes(64);

        // Convert the hash bytes to a Base64 string
        string hashPassword = Convert.ToBase64String(hashBytes);

        return hashPassword;
    }
}
