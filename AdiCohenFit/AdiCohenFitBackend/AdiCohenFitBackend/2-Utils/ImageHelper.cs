using System;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace AdiCohenFit;
public static class ImageHelper
{
    private static readonly string ImageDirectory = Path.Combine("wwwroot", "assets", "images");

    public static string SaveImage(IFormFile image)
    {
        // Create directory if it doesn't exist
        if (!Directory.Exists(ImageDirectory))
        {
            Directory.CreateDirectory(ImageDirectory);
        }

        string extension = Path.GetExtension(image.FileName);
        string uniqueName = Guid.NewGuid() + extension;
        using FileStream stream = File.Create(Path.Combine(ImageDirectory, uniqueName));
        image.CopyTo(stream);
        return uniqueName;
    }

    public static string UpdateImage(IFormFile image, string? previousImageName)
    {
        DeleteImage(previousImageName);
        return SaveImage(image);
    }

    public static void DeleteImage(string? previousImageName)
    {
        if (previousImageName == null) return;
        string filePath = Path.Combine(ImageDirectory, previousImageName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }

    public static byte[] GetImageBytes(string imageName)
    {
        string filePath = Path.Combine(ImageDirectory, imageName);
        if (!File.Exists(filePath))
        {
            // Try to use NotFound.jpg as fallback
            string fallbackPath = Path.Combine(ImageDirectory, "NotFound.jpg");
            if (!File.Exists(fallbackPath))
            {
                // Return empty byte array if even the fallback is missing
                return new byte[0];
            }
            filePath = fallbackPath;
        }

        byte[] imageBytes = File.ReadAllBytes(filePath);
        return imageBytes;
    }
}