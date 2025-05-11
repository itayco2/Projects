import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeModel } from '../../../models/recipe.model';
import { CategoryModel } from '../../../models/category.model';
import { UserStore } from '../../../storage/user-store';
import { AuthService } from '../../../services/auth.service';
import { RecipeService } from '../../../services/recipe.service';
import { CategoryService } from '../../../services/category.service';
import { Router } from '@angular/router';
import { NotifyService } from '../../../services/notify.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-recipe-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class RecipeListComponent implements OnInit {

    public recipes: RecipeModel[] = [];
    public filteredRecipes: RecipeModel[] = [];
    public categories: CategoryModel[] = [];
    public imageBaseUrl = 'http://localhost:5022/images/';
    public isLoading: boolean = true;

    public canAddRecipe: boolean = false;
    public sortOrder: 'asc' | 'desc' = 'asc'; // Default sort order
    public categoryFilter: string = 'all'; // Default to show all categories
    public searchTerm: string = ''; // For text search

    public authService = inject(AuthService); 
    private userStore = inject(UserStore); 
    private sanitizer = inject(DomSanitizer);

    constructor(
        private recipeService: RecipeService,
        private categoryService: CategoryService,
        private router: Router,
        private notifyService: NotifyService
    ) {}

    public async ngOnInit() {
        try {
            this.isLoading = true;
            
            // Get categories for the dropdown first
            this.categories = await this.categoryService.getAllCategories();
            
            // Then get recipes from service
            this.recipes = await this.recipeService.getAllRecipes();
            
            // Process each recipe to ensure image URLs are properly set
            this.recipes = this.recipes.map(recipe => {
                // Apply the withImageUrl method from the RecipeModel
                return RecipeModel.withImageUrl(recipe);
            });
            
            // Initial filtering and sorting
            this.filterRecipes();
            
            // Check user permissions
            this.canAddRecipe = this.authService.hasRole(["Admin"]);
            
            // Simulate a slight delay for the animation to be noticed
            setTimeout(() => {
                this.isLoading = false;
            }, 300);
            
        } catch (err: any) {
            this.isLoading = false;
            this.notifyService.error(err);
        }
    }

    // Filter recipes based on search term and category
    public filterRecipes() {
        this.filteredRecipes = this.recipes.filter(recipe => {
            // Check if matches search term (case insensitive)
            const matchesSearch = this.searchTerm 
                ? recipe.recipeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                  recipe.recipeDescription.toLowerCase().includes(this.searchTerm.toLowerCase())
                : true;
            
            // Check if matches selected category
            const matchesCategory = this.categoryFilter === 'all' || recipe.categoryId === this.categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        // Apply sort after filtering
        this.sortRecipes();
    }

    // Method to sort recipes
    public sortRecipes() {
        this.filteredRecipes.sort((a, b) => {
            if (this.sortOrder === 'asc') {
                return a.recipeName.localeCompare(b.recipeName);
            } else {
                return b.recipeName.localeCompare(a.recipeName);
            }
        });
    }

    // Toggle sort order
    public toggleSortOrder() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        this.sortRecipes();
    }

    // Get category name by ID
    public getCategoryName(categoryId: string): string {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.categoryName : '';
    }

    // Get safe background style with proper error handling
    getBackgroundStyle(recipe: RecipeModel): SafeStyle {
        if (!recipe.imageUrl && recipe.imageName) {
            // Ensure we have an imageUrl by using the imageBaseUrl directly
            const imageUrl = `${this.imageBaseUrl}${recipe.imageName}`;
            return this.sanitizer.bypassSecurityTrustStyle(`url(${imageUrl})`);
        } else if (recipe.imageUrl) {
            // Use the already processed imageUrl
            return this.sanitizer.bypassSecurityTrustStyle(`url(${recipe.imageUrl})`);
        } else {
            // Fallback to a placeholder image
            return this.sanitizer.bypassSecurityTrustStyle('url("/assets/images/placeholder-recipe.jpg")');
        }
    }

    public async deleteRecipe(recipeId: string) {
        try {
            const sure = confirm("האם אתה בטוח שברצונך למחוק מתכון זה?");
            if (!sure) return;
            
            // Show deletion in progress
            this.notifyService.success("מוחק מתכון...");
            
            await this.recipeService.deleteRecipe(recipeId);
            this.notifyService.success("המתכון נמחק בהצלחה!");
            
            // Refresh the recipe list
            this.recipes = this.recipes.filter(r => r.id !== recipeId);
            this.filterRecipes(); // Re-apply filters after deletion
        }
        catch (err: any) {
            this.notifyService.error(err);
        }
    }

    public goToRecipeDetails(recipeId: string) {
        // Add smooth transition effect
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            this.router.navigateByUrl(`/Recipe/details/${recipeId}`);
            document.body.style.opacity = '1';
        }, 300);
    }

    public goToRecipeEdit(recipeId: string) {
        this.router.navigateByUrl(`/Recipe/edit/${recipeId}`);
    }

    // Calculate total time (prep + cook)
    calculateTotalTime(recipe: RecipeModel): number {
        return recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    }
    
    // Handle recipe image errors
    handleImageError(recipe: RecipeModel): void {
        console.error('Image failed to load:', recipe.imageUrl || (this.imageBaseUrl + recipe.imageName));
        // Set a fallback image
        recipe.imageUrl = '/assets/images/placeholder-recipe.jpg';
    }
}