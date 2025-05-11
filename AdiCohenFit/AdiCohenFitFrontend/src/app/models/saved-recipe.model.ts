import { RecipeModel } from "./recipe.model";

export class SavedRecipeDto {
    public id: string;
    public userId: string;
    public recipeId: string;
    public savedAt: Date;

    
    
    // Navigation property
    public recipe?: RecipeModel;
}

// Request model for saving a recipe
export class SaveRecipeRequestDto {
    public recipeId: string;
}