using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace University_backend;

public static class Extensions
{
    // Retrieves the first error message from the ModelStateDictionary
    public static string GetFirstError(this ModelStateDictionary modelState)
    {
        // Find the first ModelStateEntry that contains errors and return the first error message
        return modelState.Values.Where(v => v.Errors.Any()).First().Errors.First().ErrorMessage;
    }

    // Retrieves all error messages from the ModelStateDictionary as a single string
    public static string GetAllErrors(this ModelStateDictionary modelState)
    {
        string errors = "";

        // Iterate through each KeyValuePair in the ModelStateDictionary
        foreach (KeyValuePair<string, ModelStateEntry> item in modelState)
        {
            // Iterate through each error in the ModelStateEntry
            foreach (ModelError err in item.Value.Errors)
            {
                // Append the error message to the errors string
                errors += err.ErrorMessage + " ";
            }
        }

        // Trim any trailing whitespace and return the concatenated error messages
        return errors.Trim();
    }
}
