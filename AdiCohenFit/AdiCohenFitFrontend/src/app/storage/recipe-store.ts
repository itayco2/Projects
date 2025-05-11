import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { environment } from "../../environments/environment.development";
import { RecipeModel } from "../models/recipe.model";

export type RecipeState = {
    recipes : RecipeModel[];
};

const initialState: RecipeState = {
    recipes: []
};

export const recipeStore = signalStore(
    {providedIn: "root"},

    withState(initialState),

    withMethods(store =>({
        initRecipes(recipes: RecipeModel[]) : void {
            patchState(store, _currentState => ({recipes}));
        },
        addRecipe(recipe: RecipeModel) : void {
            patchState(store, currentState => ({recipes: [...currentState.recipes, recipe]}));
        },
        updateRecipe(recipe: RecipeModel) : void {
            patchState(store, currentState => ({recipes: currentState.recipes.map(r => r.id === recipe.id ? recipe : r)}));
        },
        deleteRecipe(id : string) : void {
            patchState(store, currentState => ({recipes: currentState.recipes.filter(r => r.id !== id)}));
        }
    })),
    // Create computed values
    withComputed(store => ({
        count: computed(() => store.recipes().length),
    })),

    // Adding reports to debug tool
    environment.isDevelopment && withDevtools("recipeStore")
)