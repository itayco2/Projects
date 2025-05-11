import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecipeModel } from '../../../models/recipe.model';
import { RecipeService } from '../../../services/recipe.service';
import { NotifyService } from '../../../services/notify.service';
import { CategoryService } from '../../../services/category.service';
import { AuthService } from '../../../services/auth.service';
import { SavedRecipeService } from '../../../services/saved-recipe.service';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

// Debug mode to help troubleshoot issues
const DEBUG_MODE = true;

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css']
})
export class RecipeDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('deleteDialog') deleteDialog: TemplateRef<any>;

  public recipe: RecipeModel;
  public isLoading = true;
  public categoryName = '';
  public ingredientsList: string[] = [];
  public instructionsList: string[] = [];
  public canEdit = false;
  public isRecipeSaved = false;
  public isSavingRecipe = false;
  public imageBaseUrl = 'http://localhost:5022/images/';
  
  // Track subscriptions to prevent memory leaks
  private subscriptions: Subscription[] = [];

  constructor(
    private recipeService: RecipeService,
    private categoryService: CategoryService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private savedRecipeService: SavedRecipeService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    
    // Check auth status only once on initialization
    this.updateEditPermissions();
    
    // Subscribe to authentication changes
    const authSub = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      // Update edit permissions whenever auth status changes
      this.updateEditPermissions();
    });
    this.subscriptions.push(authSub);
    
    // Get recipe ID from route
    const recipeId = this.route.snapshot.paramMap.get('id');
    
    if (recipeId) {
      this.loadRecipe(recipeId);
    } else {
      this.isLoading = false;
      this.notifyService.error('לא ניתן לטעון את המתכון - מזהה חסר');
    }
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  

  // Enhanced authentication check - avoid excessive token validation
  private updateEditPermissions(): void {
    try {
      // Get token directly - avoid validating it multiple times
      const token = localStorage.getItem('token');
      
      if (token) {
        // Get roles without triggering additional token validations
        const roles = this.authService.getUserRoles();
        this.canEdit = roles.includes('Admin');
      } else {
        this.canEdit = false;
      }
      
    } catch (error) {
      this.canEdit = false;
    }
  }

  private async loadRecipe(id: string): Promise<void> {
    try {
      this.isLoading = true;
      
      // Load recipe
      this.recipe = await this.recipeService.getOneRecipe(id);
      
      if (!this.recipe) {
        this.notifyService.error('המתכון לא נמצא');
        return;
      }
      
      // Process recipe to ensure it has the correct image URL
      this.recipe = RecipeModel.withImageUrl(this.recipe);
      
      
      // Get category name
      try {
        const categories = await this.categoryService.getAllCategories();
        const category = categories.find(c => c.id === this.recipe.categoryId);
        this.categoryName = category ? category.categoryName : 'קטגוריה לא ידועה';
      } catch (error) {
        this.categoryName = 'קטגוריה לא ידועה';
      }
      
      // Process ingredients into list
      this.ingredientsList = this.recipe.ingredients
        .split('\n')
        .filter(ingredient => ingredient.trim().length > 0);
      
      // Process instructions into list
      this.instructionsList = this.recipe.instructions
        .split('\n')
        .filter(step => step.trim().length > 0);
      
      
      // Check if recipe is saved - only if we have a token
      if (localStorage.getItem('token')) {
        await this.checkSavedStatus(id);
      }
      
    } catch (error) {
      this.notifyService.error('אירעה שגיאה בטעינת המתכון');
    } finally {
      this.isLoading = false;
    }
  }
  
  // Get background style for recipe header
  getBackgroundImageStyle(): SafeStyle {
    if (!this.recipe) {
      return this.sanitizer.bypassSecurityTrustStyle('linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("/assets/images/placeholder-recipe.jpg")');
    }
    
    if (this.recipe.imageUrl) {
      return this.sanitizer.bypassSecurityTrustStyle(`linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${this.recipe.imageUrl})`);
    } else if (this.recipe.imageName) {
      const imageUrl = `${this.imageBaseUrl}${this.recipe.imageName}`;
      return this.sanitizer.bypassSecurityTrustStyle(`linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${imageUrl})`);
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("/assets/images/placeholder-recipe.jpg")');
    }
  }
  
  private async checkSavedStatus(recipeId: string): Promise<void> {
    try {
      // Only check if user has a token without validating it
      const token = localStorage.getItem('token');
      
      if (token) {
        // Let the saved recipe service handle authentication errors
        this.isRecipeSaved = await this.savedRecipeService.checkIfRecipeIsSaved(recipeId);
      } else {
        this.isRecipeSaved = false;
      }
    } catch (error) {
      this.isRecipeSaved = false;
    }
  }
  
  public async toggleSaveRecipe(): Promise<void> {
    try {
      // First verify the user is authenticated, but don't validate token
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.notifyService.error('יש להתחבר כדי לשמור מתכונים');
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: this.router.url } 
        });
        return;
      }
      
      this.isSavingRecipe = true;
      
      if (this.isRecipeSaved) {
        // Remove from saved recipes
        await this.savedRecipeService.removeSavedRecipe(this.recipe.id);
        this.isRecipeSaved = false;
        this.notifyService.success('המתכון הוסר מהמתכונים השמורים');
      } else {
        // Save recipe
        await this.savedRecipeService.saveRecipe(this.recipe.id);
        this.isRecipeSaved = true;
        this.notifyService.success('המתכון נשמר בהצלחה');
      }
    } catch (error) {
      
      // Handle specific error types
      if (error instanceof Error && error.message.includes('Authentication required')) {
        // Error is already handled by service
      } else {
        this.notifyService.error('אירעה שגיאה בשמירת המתכון');
      }
    } finally {
      this.isSavingRecipe = false;
    }
  }

  public goBack(): void {
    this.router.navigate(['/Recipe']);
  }

  public editRecipe(): void {
    this.router.navigate(['/Recipe/edit', this.recipe.id]);
  }

  public confirmDelete(): void {
    const dialogRef = this.dialog.open(this.deleteDialog);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteRecipe();
      }
    });
  }

  private async deleteRecipe(): Promise<void> {
    try {
      await this.recipeService.deleteRecipe(this.recipe.id);
      this.notifyService.success('המתכון נמחק בהצלחה');
      this.router.navigate(['/Recipe']);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      this.notifyService.error('אירעה שגיאה במחיקת המתכון');
    }
  }

  public printRecipe(): void {
    window.print();
  }
}