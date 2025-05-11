import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { savedRecipeStore } from '../storage/saved-recipe-store';
import { SavedRecipeDto, SaveRecipeRequestDto } from '../models/saved-recipe.model';
import { RecipeModel } from '../models/recipe.model';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';

@Injectable({
  providedIn: 'root'
})
export class SavedRecipeService {
    private httpClient = inject(HttpClient);
    private savedRecipeStore = inject(savedRecipeStore);
    private router = inject(Router);
    private authService = inject(AuthService);
    private notifyService = inject(NotifyService);
    
    private apiUrl = `${environment.savedRecipesUrl}`;
    // Flag to track if API is available
    private isApiAvailable = true;

    // Helper to create headers with token
    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    public async getUserSavedRecipes(): Promise<SavedRecipeDto[]> {
        try {
            // Check if user is authenticated first
            if (!this.authService.isAuthenticated()) {
                return this.savedRecipeStore.count() ? this.savedRecipeStore.savedRecipes() : [];
            }

            // If we already know API is unavailable, use local storage
            if (!this.isApiAvailable && this.savedRecipeStore.count()) {
                return this.savedRecipeStore.savedRecipes();
            }

            // Add explicit headers with token
            const headers = this.getAuthHeaders();
            const savedRecipes$ = this.httpClient.get<SavedRecipeDto[]>(this.apiUrl, { headers })
                .pipe(
                    catchError((error) => {
                        // Handle 401 separately
                        if (error instanceof HttpErrorResponse && error.status === 401) {
                            console.warn('Authentication error in getUserSavedRecipes:', error);
                            // Don't redirect to login here, just return empty array
                            return of([]);
                        }

                        this.isApiAvailable = false;
                        this.handleError('Error fetching saved recipes', error);
                        // Return empty array if store is empty
                        return of(this.savedRecipeStore.count() ? this.savedRecipeStore.savedRecipes() : []);
                    })
                );
            
            const savedRecipes = await firstValueFrom(savedRecipes$);
            
            // Enhance recipes with image URLs if needed
            savedRecipes.forEach(savedRecipe => {
                if (savedRecipe.recipe) {
                    savedRecipe.recipe = RecipeModel.withImageUrl(savedRecipe.recipe as RecipeModel);
                }
            });
            
            this.savedRecipeStore.initSavedRecipes(savedRecipes);
            return savedRecipes;
        } catch (error) {
            // Fallback to local storage
            if (this.savedRecipeStore.count()) {
                return this.savedRecipeStore.savedRecipes();
            }
            return [];
        }
    }
    
    public async checkIfRecipeIsSaved(recipeId: string): Promise<boolean> {
        // Check if user is authenticated first
        if (!this.authService.isAuthenticated()) {
            // Don't redirect to login, just return false (not saved) for unauthenticated users
            return false;
        }

        // Verify user ID is present in token
        if (!this.authService.getUserId()) {
            console.warn('User ID missing from token when checking saved recipe');
            return false;
        }

        // If we already know API is unavailable, use local storage
        if (!this.isApiAvailable) {
            return this.savedRecipeStore.count() ? this.savedRecipeStore.isRecipeSaved()(recipeId) : false;
        }

        try {
            // Add explicit headers with token
            const headers = this.getAuthHeaders();
            const isRecipeSaved$ = this.httpClient.get<boolean>(`${this.apiUrl}/check/${recipeId}`, { headers })
                .pipe(
                    catchError((error) => {
                        // Handle 401 without redirecting to login for this specific check
                        if (error instanceof HttpErrorResponse && error.status === 401) {
                            console.warn('User not authenticated for saved recipe check');
                            return of(false);
                        }
                        
                        this.isApiAvailable = false;
                        // Don't log this as an error since we're handling it gracefully
                        console.warn('Saved recipe API unavailable, using local fallback');
                        // Fallback to store if API call fails
                        return of(this.savedRecipeStore.count() ? this.savedRecipeStore.isRecipeSaved()(recipeId) : false);
                    })
                );
                
            return await firstValueFrom(isRecipeSaved$);
        } catch (error) {
            // Silent fallback, no error needed
            return this.savedRecipeStore.count() ? this.savedRecipeStore.isRecipeSaved()(recipeId) : false;
        }
    }
    
    public async saveRecipe(recipeId: string): Promise<SavedRecipeDto> {
        // Check if user is authenticated first
        if (!this.authService.isAuthenticated()) {
            // Redirect to login instead of silently falling back to local storage
            this.notifyService.error('יש להתחבר כדי לשמור מתכונים');
            this.router.navigate(['/login'], { 
                queryParams: { returnUrl: this.router.url } 
            });
            throw new Error('Authentication required to save recipes');
        }

        // Verify user ID exists in token
        const userId = this.authService.getUserId();
        if (!userId) {
            console.error('User ID missing from token when trying to save recipe');
            this.notifyService.error('אירעה שגיאה באימות המשתמש, אנא התחבר/י מחדש');
            
            // Don't immediately log out and redirect - just show error and return local fallback
            if (!this.isApiAvailable) {
                return this.simulateLocalSave(recipeId);
            }
            
            throw new Error('User ID not found in token');
        }

        // If we already know API is unavailable, simulate locally
        if (!this.isApiAvailable) {
            return this.simulateLocalSave(recipeId);
        }

        try {
            // Make sure the request object format matches what your backend expects
            const requestDto: SaveRecipeRequestDto = { recipeId };
            
            // Add explicit headers with token
            const headers = this.getAuthHeaders();
            
            // Print to console for debugging
            
            const savedRecipe$ = this.httpClient.post<SavedRecipeDto>(this.apiUrl, requestDto, { headers })
                .pipe(
                    catchError((error) => {
                        if (error instanceof HttpErrorResponse) {
                            // Handle specific errors
                            if (error.status === 401) {
                                console.error('Authorization error saving recipe:', error);
                                
                                // Check if error contains 'User ID not found in claims'
                                let hasUserIdError = false;
                                if (error.error && typeof error.error === 'object' && error.error.message) {
                                    hasUserIdError = error.error.message.includes('User ID not found');
                                } else if (typeof error.error === 'string') {
                                    hasUserIdError = error.error.includes('User ID not found');
                                }
                                
                                if (hasUserIdError) {
                                    // Try to refresh the token or clear it
                                    this.notifyService.error('אירעה שגיאה באימות המשתמש, אנא התחבר/י מחדש');
                                    this.authService.logout();
                                    this.router.navigate(['/login'], { 
                                        queryParams: { returnUrl: this.router.url } 
                                    });
                                }
                            }
                        }
                        
                        throw error;
                    })
                );
            
            const savedRecipe = await firstValueFrom(savedRecipe$);
            
            // Enhance recipe with image URL if needed
            if (savedRecipe.recipe) {
                savedRecipe.recipe = RecipeModel.withImageUrl(savedRecipe.recipe as RecipeModel);
            }
            
            this.savedRecipeStore.addSavedRecipe(savedRecipe);
            return savedRecipe;
        } catch (error) {
            console.error('Error in saveRecipe:', error);
            
            // For network or other errors, use the local fallback
            this.isApiAvailable = false;
            return this.simulateLocalSave(recipeId);
        }
    }
    
    public async removeSavedRecipe(recipeId: string): Promise<void> {
        // Check if user is authenticated first
        if (!this.authService.isAuthenticated()) {
            this.savedRecipeStore.removeSavedRecipe(recipeId);
            return;
        }

        // Verify user ID exists in token
        const userId = this.authService.getUserId();
        if (!userId) {
            console.warn('User ID missing from token when removing saved recipe');
            // Just remove locally without error
            this.savedRecipeStore.removeSavedRecipe(recipeId);
            return;
        }

        // If we already know API is unavailable, simulate locally
        if (!this.isApiAvailable) {
            this.savedRecipeStore.removeSavedRecipe(recipeId);
            return;
        }

        try {
            // Add explicit headers with token
            const headers = this.getAuthHeaders();
            const response$ = this.httpClient.delete(`${this.apiUrl}/${recipeId}`, { headers })
                .pipe(
                    catchError((error) => {
                        // Handle 401 separately
                        if (error instanceof HttpErrorResponse && error.status === 401) {
                            console.warn('Authentication error when removing saved recipe:', error);
                            // Don't redirect to login, just remove locally
                            this.savedRecipeStore.removeSavedRecipe(recipeId);
                            return of(null);
                        }
                        
                        this.isApiAvailable = false;
                        console.warn('Saved recipe API unavailable, using local fallback');
                        this.savedRecipeStore.removeSavedRecipe(recipeId);
                        return of(null);
                    })
                );
                
            await firstValueFrom(response$);
            this.savedRecipeStore.removeSavedRecipe(recipeId);
        } catch (error) {
            // Remove locally anyway
            this.savedRecipeStore.removeSavedRecipe(recipeId);
        }
    }

    // Helper method to handle auth errors
    private handleAuthError(): void {
        // Redirect to login with return URL
        this.router.navigate(['/login'], { 
            queryParams: { returnUrl: this.router.url } 
        });
    }

    // Helper method to simulate saving a recipe locally when API is unavailable
    private simulateLocalSave(recipeId: string): SavedRecipeDto {
        // If we have a valid user ID, use it, otherwise use a placeholder
        const userId = this.authService.getUserId() || 'local-user';
        
        const newSavedRecipe: SavedRecipeDto = {
            id: this.generateTempId(),
            recipeId: recipeId,
            userId: userId,
            savedAt: new Date()
        };
        
        this.savedRecipeStore.addSavedRecipe(newSavedRecipe);
        return newSavedRecipe;
    }

    // Generate a temporary local ID
    private generateTempId(): string {
        return 'local-' + Math.random().toString(36).substring(2, 15);
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