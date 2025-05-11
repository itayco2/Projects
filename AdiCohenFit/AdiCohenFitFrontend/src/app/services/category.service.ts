import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { categoryStore } from '../storage/category-store';
import { CategoryModel } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
    private httpClient = inject(HttpClient);
    private categoryStore = inject(categoryStore);

    public async getAllCategories(): Promise<CategoryModel[]> {
       if(this.categoryStore.count()) return this.categoryStore.categories();

       const dbCategories$ = this.httpClient.get<CategoryModel[]>(environment.categoryUrl);
       const dbCategories = await firstValueFrom(dbCategories$);

       this.categoryStore.initCategories(dbCategories);
       return dbCategories;
    }

    public async getOneCategory(categoryId: string): Promise<CategoryModel> {
        const storedCategory = this.categoryStore.categories().find(c => c.id === categoryId);
        if(storedCategory) return storedCategory;
        
        const dbCategory$ = this.httpClient.get<CategoryModel>(`${environment.categoryUrl}/${categoryId}`);
        const dbCategory = await firstValueFrom(dbCategory$);
        return dbCategory;
    }

    /**
     * Updates a category - tries both FormData and JSON approaches
     */
    public async updateCategory(formData: FormData | any, id: string): Promise<void> {
        try {
            // Try with FormData first
            if (formData instanceof FormData) {
                formData.forEach((value, key) => {
                });
                
                const dbCategory$ = this.httpClient.put<CategoryModel>(
                    `${environment.categoryUrl}/${id}`, 
                    formData
                );
                const updatedCategory = await firstValueFrom(dbCategory$);
                this.categoryStore.updateCategory(updatedCategory);
            } else {
                // Try with JSON if FormData fails
                const headers = new HttpHeaders().set('Content-Type', 'application/json');
                
                const dbCategory$ = this.httpClient.put<CategoryModel>(
                    `${environment.categoryUrl}/${id}`, 
                    formData, 
                    { headers }
                );
                const updatedCategory = await firstValueFrom(dbCategory$);
                this.categoryStore.updateCategory(updatedCategory);
            }
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    /**
     * Adds a new category - tries both FormData and JSON approaches
     */
    public async addCategory(category: CategoryModel): Promise<CategoryModel> {
        try {
            // First attempt: Use FormData
            const formData = CategoryModel.toFormData(category);
            formData.forEach((value, key) => {
            });
            
            try {
                const dbCategory$ = this.httpClient.post<CategoryModel>(
                    environment.categoryUrl, 
                    formData
                );
                const dbCategory = await firstValueFrom(dbCategory$);
                this.categoryStore.addCategory(dbCategory);
                return dbCategory;
            } catch (formDataError) {
                console.error('FormData approach failed:', formDataError);
                
                // Second attempt: Try with JSON
                const headers = new HttpHeaders().set('Content-Type', 'application/json');
                
                // Create a clean object with just the required properties
                const categoryData = {
                    categoryName: category.categoryName,
                    categoryDescription: category.categoryDescription || ''
                };
                
                const dbCategory$ = this.httpClient.post<CategoryModel>(
                    environment.categoryUrl, 
                    categoryData, 
                    { headers }
                );
                const dbCategory = await firstValueFrom(dbCategory$);
                this.categoryStore.addCategory(dbCategory);
                return dbCategory;
            }
        } catch (error) {
            console.error('Error adding Category:', error);
            throw error;
        }
    }

    public async deleteCategory(categoryId: string): Promise<void> {
        if (!categoryId) {
            throw new Error("Category ID is required");
        }
        
        const dbCategory$ = this.httpClient.delete<void>(`${environment.categoryUrl}/${categoryId}`);
        await firstValueFrom(dbCategory$);
        this.categoryStore.deleteCategory(categoryId); 
    }
}