export class RecipeModel {
    public id: string;
    public recipeName: string;
    public recipeDescription: string;
    public ingredients: string;
    public instructions: string;
    public prepTimeMinutes: number;
    public cookTimeMinutes: number;
    public servings: number;
    public imageName: string;
    public categoryId: string;
    
    // Frontend-specific properties
    public imageUrl?: string; // Optional URL for displaying the image
    public image?: File; // For file upload in forms

    public static toFormData(recipe: RecipeModel): FormData {
        const formData = new FormData();
        formData.append("Id", recipe.id);
        formData.append("RecipeName", recipe.recipeName);
        formData.append("RecipeDescription", recipe.recipeDescription);
        formData.append("Ingredients", recipe.ingredients);
        formData.append("Instructions", recipe.instructions);
        formData.append("PrepTimeMinutes", recipe.prepTimeMinutes.toString());
        formData.append("CookTimeMinutes", recipe.cookTimeMinutes.toString());
        formData.append("Servings", recipe.servings.toString());
        formData.append("CategoryId", recipe.categoryId);
    
        formData.append("ImageName", recipe.imageName);
        
        // Add the file if it exists
        if (recipe.image) {
            formData.append("image", recipe.image, recipe.imageName);
        }
        
        return formData;
    }
    
    // Method to add the image URL path, only if ImageName is provided
    public static withImageUrl(recipe: RecipeModel): RecipeModel {
        if (recipe.imageName) {
            // Point to the correct images folder at root level
            recipe.imageUrl = `http://localhost:5022/images/${recipe.imageName}`;
        }
        return recipe;
    }
}