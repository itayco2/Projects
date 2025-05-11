import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RecipeModel } from '../../../models/recipe.model';
import { CategoryModel } from '../../../models/category.model';
import { RecipeService } from '../../../services/recipe.service';
import { CategoryService } from '../../../services/category.service';
import { NotifyService } from '../../../services/notify.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-recipe-new',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    MatFormFieldModule, 
    MatButtonModule, 
    MatInputModule, 
    MatIconModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './recipe-new.component.html',
  styleUrl: './recipe-new.component.css'
})
export class RecipeNewComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('categoryDialog') categoryDialog!: TemplateRef<any>;

    public recipeFormGroup!: FormGroup;
    public categoryFormGroup!: FormGroup;
    
    // Added these properties for file handling
    public selectedImageFile: File | null = null;
    public selectedFileName: string | null = null;
    
    // Categories for the dropdown
    public categories: { id: string, name: string }[] = [];
    
    // Dialog reference
    private dialogRef: MatDialogRef<any> | null = null;
    
    // Category being edited
    private currentCategoryId: string | null = null;
    public isEditMode: boolean = false;

    constructor(
        private recipeService: RecipeService,
        private categoryService: CategoryService,
        private notifyService: NotifyService,
        private router: Router,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) {}

    async ngOnInit(): Promise<void> {
       this.initRecipeForm();
       this.initCategoryForm();
       await this.loadCategories();
    }

    private initRecipeForm(): void {
        this.recipeFormGroup = this.formBuilder.group({
            nameControl: new FormControl('', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(50)
            ]),
            descriptionControl: new FormControl('', [
                Validators.required,
                Validators.minLength(20),
                Validators.maxLength(500)
            ]),
            ingredientsControl: new FormControl('', [
                Validators.required,
                Validators.minLength(10)
            ]),
            instructionsControl: new FormControl('', [
                Validators.required,
                Validators.minLength(20)
            ]),
            prepTimeControl: new FormControl('', [
                Validators.required,
                Validators.min(1)
            ]),
            cookTimeControl: new FormControl('', [
                Validators.required,
                Validators.min(0)
            ]),
            servingsControl: new FormControl('', [
                Validators.required,
                Validators.min(1)
            ]),
            categoryControl: new FormControl('', [
                Validators.required
            ]),
            imageControl: new FormControl('', [
                Validators.required
            ])
        });
    }

    private initCategoryForm(): void {
        this.categoryFormGroup = this.formBuilder.group({
            categoryNameControl: new FormControl('', [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(30)
            ])
        });
    }

    private async loadCategories(): Promise<void> {
        try {
            const categoryModels = await this.categoryService.getAllCategories();
            this.categories = categoryModels.map(category => ({
                id: category.id,
                name: category.categoryName
            }));
        } catch (err: any) {
            this.notifyService.error("שגיאה בטעינת קטגוריות");
            console.error(err);
        }
    }

    onFileSelected(): void {
        const files = this.fileInput.nativeElement.files;
        if (files && files.length > 0) {
          this.selectedImageFile = files[0];
          this.selectedFileName = files[0].name;
          // Update form control value
          this.recipeFormGroup.get('imageControl')?.setValue(this.selectedFileName);
        } else {
          this.selectedImageFile = null;
          this.selectedFileName = null;
          this.recipeFormGroup.get('imageControl')?.setValue(null);
        }
    }

    // Open the category dialog for adding a new category
    openCategoryDialog(): void {
        this.isEditMode = false;
        this.currentCategoryId = null;
        this.categoryFormGroup.reset();
        this.dialogRef = this.dialog.open(this.categoryDialog, {
            width: '400px'
        });
    }

    // Edit an existing category
    editCategory(category: { id: string, name: string }): void {
        this.isEditMode = true;
        this.currentCategoryId = category.id;
        this.categoryFormGroup.patchValue({
            categoryNameControl: category.name
        });
        this.dialogRef = this.dialog.open(this.categoryDialog, {
            width: '400px'
        });
    }

 // Save a new or updated category
async saveCategory(): Promise<void> {
    if (this.categoryFormGroup.invalid) {
        this.categoryFormGroup.markAllAsTouched();
        return;
    }

    const categoryName = this.categoryFormGroup.get('categoryNameControl')?.value;
    
    try {
        if (this.isEditMode && this.currentCategoryId) {
            // Update existing category
            // IMPORTANT: Create a proper category model for update
            const updatedCategory = new CategoryModel();
            updatedCategory.id = this.currentCategoryId;
            updatedCategory.categoryName = categoryName;
            
            // Use pure JSON object for update
            const categoryData = {
                id: this.currentCategoryId,
                categoryName: categoryName 
            };
            
            await this.categoryService.updateCategory(categoryData, this.currentCategoryId);
            this.notifyService.success('הקטגוריה עודכנה בהצלחה');
        } else {
            // Add new category
            const newCategory = new CategoryModel();
            newCategory.categoryName = categoryName;
            // Not setting id for new categories
            
            const result = await this.categoryService.addCategory(newCategory);
            this.categories.push({
                id: result.id,
                name: result.categoryName
            });
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
    // Delete a category
    async deleteCategory(categoryId: string): Promise<void> {
        try {
            // Check if category is in use
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

    public async send() {
        try {
            // First, validate the form
            if (this.recipeFormGroup.invalid) {
                // Find the first invalid control and mark it as touched to trigger error message
                const controls = this.recipeFormGroup.controls;
                for (const controlName in controls) {
                    if (controls[controlName].invalid) {
                        controls[controlName].markAsTouched();
                        console.error(`Invalid control: ${controlName}`, controls[controlName].errors);
                    }
                }
                
                this.notifyService.error("יש למלא את כל השדות כראוי.");
                return;
            }
            
            if (!this.selectedImageFile) {
                this.notifyService.error("יש להוסיף תמונה.");
                return;
            }
        
            // Create FormData object
            const formData = new FormData();
            
            // Add all form values with proper field names that match your backend API
            // Keep PascalCase as shown in your original code
            formData.append('RecipeName', this.recipeFormGroup.get('nameControl')?.value);
            formData.append('RecipeDescription', this.recipeFormGroup.get('descriptionControl')?.value);
            formData.append('Ingredients', this.recipeFormGroup.get('ingredientsControl')?.value);
            formData.append('Instructions', this.recipeFormGroup.get('instructionsControl')?.value);
            formData.append('PrepTimeMinutes', this.recipeFormGroup.get('prepTimeControl')?.value);
            formData.append('CookTimeMinutes', this.recipeFormGroup.get('cookTimeControl')?.value);
            formData.append('Servings', this.recipeFormGroup.get('servingsControl')?.value);
            formData.append('CategoryId', this.recipeFormGroup.get('categoryControl')?.value);
            
            // Add the image file
            formData.append('Image', this.selectedImageFile);
            
            // Add the ImageName field that the backend requires
            formData.append('ImageName', this.selectedImageFile.name);
            

            
            // Send the FormData to the backend
            await this.recipeService.addRecipeWithFormData(formData);
            
            this.notifyService.success('המתכון נוצר בהצלחה');
            this.router.navigateByUrl('/Recipe');
        }
        catch(err: any) {
            console.error('Error in send() method:', err);
            
            // Better error handling to show validation errors
            let errorMessage = 'אירעה שגיאה ביצירת המתכון';
            
            if (err.error) {
                if (Array.isArray(err.error)) {
                    // If it's an array of validation errors
                    try {
                        const validationErrors = err.error.map((e: any) => {
                            if (typeof e === 'string') return e;
                            return e.errorMessage || e.message || JSON.stringify(e);
                        }).join(', ');
                        console.error('Validation errors:', validationErrors);
                        errorMessage += ': ' + validationErrors;
                    } catch (parseError) {
                        console.error('Error parsing validation errors:', parseError);
                    }
                } 
                else if (typeof err.error === 'object') {
                    // Try to extract error messages from a structured error object
                    console.error('Server error details:', err.error);
                    
                    if (err.error.errorMessage) {
                        errorMessage += ': ' + err.error.errorMessage;
                    } else if (err.error.message) {
                        errorMessage += ': ' + err.error.message;
                    }
                } 
                else if (typeof err.error === 'string') {
                    // Direct error message
                    errorMessage += ': ' + err.error;
                }
            }
            
            this.notifyService.error(errorMessage);
        }
    }
}