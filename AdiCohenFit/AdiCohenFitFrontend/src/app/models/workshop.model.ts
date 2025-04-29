export class workshopModel {
    public id: string;
    public workshopName: string;
    public workshopDescription: string;
    public workshopPlacesLeft: number;
    public workshopPrice: number;
    public workshopDate : Date;
    public imageName: string;
    public imageUrl?: string; // Optional for frontend use only
    public paymentLink?: string; 
    image?: File; // Added the 'image' property


// Updated toFormData method for your workshopModel class

public static toFormData(workshop: workshopModel): FormData {
    const formData = new FormData();
    formData.append("Id", workshop.id);
    formData.append("WorkshopName", workshop.workshopName);
    formData.append("WorkshopDescription", workshop.workshopDescription);
    formData.append("WorkshopPlacesLeft", workshop.workshopPlacesLeft.toString());
    formData.append("WorkshopPrice", workshop.workshopPrice.toString());
    formData.append("WorkshopDate", workshop.workshopDate.toString());
    formData.append("PaymentLink", workshop.paymentLink.toString());

    formData.append("ImageName", workshop.imageName);
    
    // Add the file if it exists
    if (workshop.image) {
        formData.append("image", workshop.image, workshop.imageName);
    }
    
    return formData;
}

    // Method to add the image URL path, only if ImageName is provided
    public static withImageUrl(workshop: workshopModel): workshopModel {
        if (workshop.imageName) {
            // Make sure the image URL path is valid
            workshop.imageUrl = `/assets/images/${workshop.imageName}`;
        }
        return workshop;
    }
}
