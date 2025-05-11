import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { environment } from "../../environments/environment.development";
import { CategoryModel } from "../models/category.model";

export type CategoryState = {
    categories : CategoryModel[];
};

const initialState: CategoryState = {
    categories: []
};

export const categoryStore = signalStore(
    {providedIn: "root"},

    withState(initialState),

    withMethods(store =>({
        initCategories(categories: CategoryModel[]) : void {
            patchState(store, _currentState => ({categories}));
        },
        addCategory(category: CategoryModel) : void {
            patchState(store, currentState => ({categories: [...currentState.categories, category]}));
        },
        updateCategory(category: CategoryModel) : void {
            patchState(store, currentState => ({categories: currentState.categories.map(c => c.id === category.id ? category : c)}));
        },
        deleteCategory(id : string) : void {
            patchState(store, currentState => ({categories: currentState.categories.filter(c => c.id !== id)}));
        }
    })),
    // Create computed values
    withComputed(store => ({
        count: computed(() => store.categories().length),
    })),

    // Adding reports to debug tool
    environment.isDevelopment && withDevtools("categoryStore")
)