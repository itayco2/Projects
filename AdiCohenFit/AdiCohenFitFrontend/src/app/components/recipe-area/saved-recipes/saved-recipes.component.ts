// src/app/features/recipes/saved-recipes/saved-recipes.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SavedRecipeService } from '../../../services/saved-recipe.service';
import { savedRecipeStore } from '../../../storage/saved-recipe-store';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { RecipeModel } from '../../../models/recipe.model';
import { NotifyService } from '../../../services/notify.service';
import { RecipeService } from '../../../services/recipe.service';
import { CategoryModel } from '../../../models/category.model';

// Enable debug mode for detailed logging
const DEBUG_MODE = true;

@Component({
  selector: 'app-saved-recipes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './saved-recipes.component.html',
  styleUrls: ['./saved-recipes.component.css']
})
export class SavedRecipesComponent implements OnInit {
  private savedRecipeService = inject(SavedRecipeService);
  private recipeService = inject(RecipeService); // Add RecipeService for direct recipe fetching
  private store = inject(savedRecipeStore);
  private sanitizer = inject(DomSanitizer);
  private notifyService = inject(NotifyService);
  
  // Access state directly from the store
  savedRecipes = this.store.savedRecipes;
  
  // Loading and error states
  isLoading = false;
  error: string | null = null;
  
  // Match the same image base URL being used in recipe-details.component.ts
  public imageBaseUrl = 'http://localhost:5022/images/';
  public categoryName = '';
  public categories: CategoryModel[] = [];
  
  
  // Improved placeholder image with more distinct styling
  public placeholderImage = '/assets/images/placeholder-recipe.jpg';

  constructor() {
  }



  async ngOnInit(): Promise<void> {
    await this.loadSavedRecipes();
  }

  async loadSavedRecipes(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Load saved recipes from the service
      await this.savedRecipeService.getUserSavedRecipes();
      const savedRecipes = this.savedRecipes();
      
      // Detailed logging of what we received
      for (const savedRecipe of savedRecipes) {
        
        // Check if we're missing recipe data
        if (!savedRecipe.recipe || !savedRecipe.recipe.recipeName) {
          // Try to fetch the missing recipe data directly
          try {
            const recipeData = await this.recipeService.getOneRecipe(savedRecipe.recipeId);
            
            // Update the recipe in the saved recipe
            savedRecipe.recipe = recipeData;
          } catch (recipeError) {
          }
        }
      }
      
      // Process recipes to ensure they have correct image URLs
      this.processSavedRecipeImages();
    } catch (error) {
      this.error = 'Failed to load saved recipes. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }
  
  // Enhanced image processing using the same approach as recipe-details component
  private processSavedRecipeImages(): void {
    const recipes = this.savedRecipes();
    
    for (const savedRecipe of recipes) {
      if (savedRecipe && savedRecipe.recipe) {
        // Use the same withImageUrl method from RecipeModel that works in recipe-details
        savedRecipe.recipe = RecipeModel.withImageUrl(savedRecipe.recipe);
      } 
    }
  }

  // Improved error handler with more debugging
  handleImageError(event: Event, recipeName: string): void {
    const imgElement = event.target as HTMLImageElement;
    
    // Set the placeholder image
    imgElement.src = this.placeholderImage;
    
    // Also update the parent div's background-image
    const parentDiv = imgElement.parentElement;
    if (parentDiv) {
      parentDiv.style.backgroundImage = `url('${this.placeholderImage}')`;
    }
  }

  // Get image URL using the same approach as recipe-details component
  getImageUrl(recipe: RecipeModel | undefined): string {
    if (!recipe) {
      return this.placeholderImage;
    }
    
    if (recipe.imageUrl) {
      return recipe.imageUrl;
    }
    
    if (recipe.imageName) {
      // Use the exact same URL format as recipe-details component
      const url = `${this.imageBaseUrl}${recipe.imageName}`;
      return url;
    }
    
    return this.placeholderImage;
  }
  
  // Get safe style for background image similar to recipe-details approach
  getBackgroundImageStyle(recipe: RecipeModel | undefined): SafeStyle {
    const imageUrl = this.getImageUrl(recipe);
    return this.sanitizer.bypassSecurityTrustStyle(`url('${imageUrl}')`);
  }

  public getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.categoryName : '';
}

  async removeSavedRecipe(recipeId: string, event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    
    try {
      await this.savedRecipeService.removeSavedRecipe(recipeId);
      this.notifyService.success('המתכון הוסר מהמועדפים בהצלחה');
    } catch (error) {
      this.error = 'Failed to remove recipe. Please try again.';
      this.notifyService.error('אירעה שגיאה בהסרת המתכון מהמועדפים');
    }
  }

  getFormattedDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  getTotalTime(prepTime?: number, cookTime?: number): number {
    return (prepTime || 0) + (cookTime || 0);
  }
}