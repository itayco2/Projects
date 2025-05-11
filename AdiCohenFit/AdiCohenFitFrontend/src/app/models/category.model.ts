export class CategoryModel {
    public id: string = '';
    public categoryName: string = '';
    public categoryDescription: string = '';

    public static toFormData(category: CategoryModel): FormData {
        const formData = new FormData();
        
        // Only add ID if it exists (for updates)
        if (category.id) {
            formData.append("id", category.id); // Note: lowercase id to match API expectations
        }
        
        formData.append("categoryName", category.categoryName); // Note: lowercase to match API expectations
        
        // Only add description if it exists
        if (category.categoryDescription) {
            formData.append("categoryDescription", category.categoryDescription);
        }

        return formData;
    }
}