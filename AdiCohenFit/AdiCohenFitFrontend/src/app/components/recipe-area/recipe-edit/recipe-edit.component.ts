import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeModel } from '../../../models/recipe.model';
import { CategoryModel } from '../../../models/category.model';
import { RecipeService } from '../../../services/recipe.service';
import { NotifyService } from '../../../services/notify.service';
import { CategoryService } from '../../../services/category.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-recipe-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('categoryDialog') categoryDialog!: TemplateRef<any>;
  
  public recipeForm: FormGroup;
  public categoryForm: FormGroup;
  public recipe = new RecipeModel();
  public recipeId: string;
  public isNewRecipe = true;
  public categories: any[] = [];
  public imagePreview: string | ArrayBuffer | null = null;
  public isLoading = false;
  
  // Dialog and category management properties
  private dialogRef: MatDialogRef<any> | null = null;
  private currentCategoryId: string | null = null;
  public isEditMode: boolean = false;
  
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private notifyService = inject(NotifyService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.initForm();
    this.initCategoryForm();
    this.loadCategories();
    
    // Get recipe ID from URL if editing existing recipe
    this.recipeId = this.route.snapshot.params['id'];
    
    if (this.recipeId && this.recipeId !== 'new') {
      this.isNewRecipe = false;
      this.loadRecipe(this.recipeId);
    }
  }

  private async loadCategories() {
    try {
      this.categories = await this.categoryService.getAllCategories();
    } catch (err) {
      this.notifyService.error('שגיאה בטעינת קטגוריות');
    }
  }

  private async loadRecipe(id: string) {
    try {
      this.isLoading = true;
      this.recipe = await this.recipeService.getOneRecipe(id);
      
      // Update the form with recipe values
      this.recipeForm.patchValue({
        recipeName: this.recipe.recipeName,
        recipeDescription: this.recipe.recipeDescription,
        ingredients: this.recipe.ingredients,
        instructions: this.recipe.instructions,
        prepTimeMinutes: this.recipe.prepTimeMinutes,
        cookTimeMinutes: this.recipe.cookTimeMinutes,
        servings: this.recipe.servings,
        categoryId: this.recipe.categoryId
      });
      
      // Show image preview if exists
      if (this.recipe.imageUrl) {
        this.imagePreview = this.recipe.imageUrl;
      }
    } catch (err) {
      this.notifyService.error('שגיאה בטעינת המתכון');
    } finally {
      this.isLoading = false;
    }
  }

  private initForm() {
    this.recipeForm = this.fb.group({
      recipeName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      recipeDescription: ['', [Validators.required, Validators.minLength(10)]],
      ingredients: ['', [Validators.required]],
      instructions: ['', [Validators.required]],
      prepTimeMinutes: [0, [Validators.required, Validators.min(0)]],
      cookTimeMinutes: [0, [Validators.required, Validators.min(0)]],
      servings: [1, [Validators.required, Validators.min(1)]],
      categoryId: ['', [Validators.required]]
    });
  }

  private initCategoryForm() {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]]
    });
  }

  public onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      this.recipe.image = file;
      this.recipe.imageName = file.name;
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  public triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  public removeImage() {
    this.imagePreview = null;
    this.recipe.image = null;
    this.recipe.imageName = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Category management methods
  public openCategoryDialog(): void {
    this.isEditMode = false;
    this.currentCategoryId = null;
    this.categoryForm.reset();
    this.dialogRef = this.dialog.open(this.categoryDialog, {
      width: '400px'
    });
  }

  public editCategory(category: any): void {
    this.isEditMode = true;
    this.currentCategoryId = category.id;
    this.categoryForm.patchValue({
      categoryName: category.categoryName
    });
    this.dialogRef = this.dialog.open(this.categoryDialog, {
      width: '400px'
    });
  }

  public async saveCategory(): Promise<void> {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const categoryName = this.categoryForm.get('categoryName')?.value;
    
    try {
      if (this.isEditMode && this.currentCategoryId) {
        // Update existing category
        const updatedCategory = new CategoryModel();
        updatedCategory.id = this.currentCategoryId;
        updatedCategory.categoryName = categoryName;
        
        await this.categoryService.updateCategory(updatedCategory, this.currentCategoryId);
        this.notifyService.success('הקטגוריה עודכנה בהצלחה');
      } else {
        // Add new category
        const newCategory = new CategoryModel();
        newCategory.categoryName = categoryName;
        
        const result = await this.categoryService.addCategory(newCategory);
        this.notifyService.success('הקטגוריה נוספה בהצלחה');
      }
      
      // Reload categories and close dialog
      await this.loadCategories();
      this.dialogRef?.close();
    } catch (err: any) {
      this.notifyService.error(`שגיאה בשמירת הקטגוריה: ${err.message || 'אנא נסה שוב'}`);
      console.error('Error saving category:', err);
    }
  }

  public async deleteCategory(categoryId: string): Promise<void> {
    try {
      // Confirm before deleting
      const confirmDelete = confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו? מתכונים המשויכים לקטגוריה זו עלולים להיות מושפעים.');
      
      if (!confirmDelete) return;
      
      await this.categoryService.deleteCategory(categoryId);
      this.notifyService.success('הקטגוריה נמחקה בהצלחה');
      
      // Reload categories after deletion
      await this.loadCategories();
    } catch (err: any) {
      this.notifyService.error(`שגיאה במחיקת הקטגוריה: ${err.message || 'אנא נסה שוב'}`);
      console.error('Error deleting category:', err);
    }
  }

  public async onSubmit() {
    if (this.recipeForm.invalid) {
      this.notifyService.error('נא למלא את כל השדות הנדרשים');
      this.markAllAsTouched();
      return;
    }

    try {
      this.isLoading = true;
      
      // Update recipe with form values
      const formValues = this.recipeForm.value;
      this.recipe.recipeName = formValues.recipeName;
      this.recipe.recipeDescription = formValues.recipeDescription;
      this.recipe.ingredients = formValues.ingredients;
      this.recipe.instructions = formValues.instructions;
      this.recipe.prepTimeMinutes = formValues.prepTimeMinutes;
      this.recipe.cookTimeMinutes = formValues.cookTimeMinutes; 
      this.recipe.servings = formValues.servings;
      this.recipe.categoryId = formValues.categoryId;
      
      if (this.isNewRecipe) {
        // Generate a new ID for new recipes
        this.recipe.id = this.generateUniqueId();
        await this.recipeService.addRecipe(this.recipe);
        this.notifyService.success('המתכון נוסף בהצלחה!');
      } else {
        // Keep existing ID for edits
        this.recipe.id = this.recipeId;
        await this.recipeService.updateRecipe(this.recipe);
        this.notifyService.success('המתכון עודכן בהצלחה!');
      }
      
      // Navigate back to recipe list
      this.router.navigate(['/Recipe']);
    } catch (err) {
      this.notifyService.error('שגיאה בשמירת המתכון');
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  public cancel() {
    this.router.navigate(['/Recipe']);
  }

  private markAllAsTouched() {
    Object.keys(this.recipeForm.controls).forEach(key => {
      this.recipeForm.get(key).markAsTouched();
    });
  }

  private generateUniqueId(): string {
    return 'recipe-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  }
}