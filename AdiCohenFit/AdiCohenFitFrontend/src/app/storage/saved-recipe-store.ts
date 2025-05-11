import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { environment } from "../../environments/environment.development";
import { SavedRecipeDto } from "../models/saved-recipe.model";

export type SavedRecipeState = {
    savedRecipes: SavedRecipeDto[];
};

const initialState: SavedRecipeState = {
    savedRecipes: []
};

export const savedRecipeStore = signalStore(
    {providedIn: "root"},

    withState(initialState),

    withMethods(store =>({
        initSavedRecipes(savedRecipes: SavedRecipeDto[]) : void {
            patchState(store, _currentState => ({savedRecipes}));
        },
        addSavedRecipe(savedRecipe: SavedRecipeDto) : void {
            patchState(store, currentState => ({savedRecipes: [...currentState.savedRecipes, savedRecipe]}));
        },
        removeSavedRecipe(recipeId: string) : void {
            patchState(store, currentState => ({
                savedRecipes: currentState.savedRecipes.filter(sr => sr.recipeId !== recipeId)
            }));
        },
        clearSavedRecipes() : void {
            patchState(store, _currentState => ({savedRecipes: [] as SavedRecipeDto[]}));
        }
    })),
    // Create computed values
    withComputed(store => ({
        count: computed(() => store.savedRecipes().length),
        isRecipeSaved: computed(() => (recipeId: string) => 
            store.savedRecipes().some(sr => sr.recipeId === recipeId)
        )
    })),

    // Adding reports to debug tool
    environment.isDevelopment && withDevtools("savedRecipeStore")
)