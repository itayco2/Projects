import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { recipeStore } from '../storage/recipe-store';
import { RecipeModel } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
    private httpClient = inject(HttpClient);
    private recipeStore = inject(recipeStore);

    public async getAllRecipes(): Promise<RecipeModel[]> {
       if(this.recipeStore.count()) return this.recipeStore.recipes();

       const dbRecipes$ = this.httpClient.get<RecipeModel[]>(environment.recipesUrl);
       const dbRecipes = await firstValueFrom(dbRecipes$);

       this.recipeStore.initRecipes(dbRecipes);
       return dbRecipes;
    }

    public async getOneRecipe(recipeId: string): Promise<RecipeModel> {
        const storedRecipe = this.recipeStore.recipes().find(r => r.id === recipeId);
        if(storedRecipe) return storedRecipe;
        
        const dbRecipe$ = this.httpClient.get<RecipeModel>(`${environment.recipesUrl}/${recipeId}`);
        const dbRecipe = await firstValueFrom(dbRecipe$);
        return dbRecipe;
    }

    public async updateRecipe(recipe: RecipeModel): Promise<RecipeModel> {
        // Convert recipe to FormData for file upload
        const formData = RecipeModel.toFormData(recipe);
        
        const observable = this.httpClient.put<RecipeModel>(`${environment.recipesUrl}/${recipe.id}`, formData);
        return await firstValueFrom(observable);
      }

    public async addRecipeWithFormData(formData: FormData): Promise<RecipeModel> {
        try {
            // Log FormData content for debugging
            formData.forEach((value, key) => {
            });
            
            const dbRecipe$ = this.httpClient.post<RecipeModel>(environment.recipesUrl, formData);
            const dbRecipe = await firstValueFrom(dbRecipe$);
            this.recipeStore.addRecipe(dbRecipe);
            return dbRecipe;
        } catch (error) {
            this.handleError('Error adding recipe', error);
            throw error;
        }
    }

    // Alternative method that accepts JSON data instead of FormData
    public async addRecipe(recipe: Partial<RecipeModel>): Promise<RecipeModel> {
        try {
            const dbRecipe$ = this.httpClient.post<RecipeModel>(environment.recipesUrl, recipe);
            const dbRecipe = await firstValueFrom(dbRecipe$);
            this.recipeStore.addRecipe(dbRecipe);
            return dbRecipe;
        } catch (error) {
            this.handleError('Error adding recipe', error);
            throw error;
        }
    }

    public async deleteRecipe(recipeId: string): Promise<void> {
        if (!recipeId) {
            throw new Error("Recipe ID is required");
        }
        
        try {
            const dbRecipe$ = this.httpClient.delete(`${environment.recipesUrl}/${recipeId}`);
            await firstValueFrom(dbRecipe$);
            this.recipeStore.deleteRecipe(recipeId);
        } catch (error) {
            this.handleError('Error deleting recipe', error);
            throw error;
        }
    }

    private handleError(message: string, error: any): void {
        console.error(message, error);
        
        if (error instanceof HttpErrorResponse) {
            console.error('Status:', error.status);
            console.error('Error details:', error.error);
            
            // Extract more specific error information if available
            if (error.error && typeof error.error === 'object') {
                console.error('Server validation errors:', error.error);
            }
        }
    }
}