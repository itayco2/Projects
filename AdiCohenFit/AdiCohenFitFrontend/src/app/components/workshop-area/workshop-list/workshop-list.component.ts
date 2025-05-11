import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { workshopModel } from '../../../models/workshop.model';
import { UserStore } from '../../../storage/user-store';
import { AuthService } from '../../../services/auth.service';
import { WorkshopService } from '../../../services/workshop.service';
import { Router } from '@angular/router';
import { NotifyService } from '../../../services/notify.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-workshop-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './workshop-list.component.html',
  styleUrl: './workshop-list.component.css'
})
export class WorkshopListComponent implements OnInit {

    public workshops: workshopModel[] = [];
    imageBaseUrl = 'http://localhost:5022/assets/images/';

    public canAddWorkshop: boolean = false;
    public sortOrder: 'asc' | 'desc' = 'asc'; // Default sort order

    public authService = inject(AuthService); 
    private userStore = inject(UserStore); 
    private sanitizer = inject(DomSanitizer);

    constructor(
        private workshopService: WorkshopService,
        private router: Router,
        private notifyService: NotifyService
    ) {}

    public async ngOnInit() {
        try {
            this.workshops = await this.workshopService.getAllWorkshops();
            
            // Sort workshops by date (ascending by default)
            this.sortWorkshopsByDate();
            
            // Debug image URLs
            this.workshops.forEach(workshop => {
                const imageUrl = `${this.imageBaseUrl}${workshop.imageName}`;
            });
            
            this.canAddWorkshop = this.authService.hasRole(["Admin"]);
        } catch (err: any) {
            this.notifyService.error(err);
        }
    }

    // Method to sort workshops by date
    public sortWorkshopsByDate() {
        this.workshops.sort((a, b) => {
            const dateA = new Date(a.workshopDate).getTime();
            const dateB = new Date(b.workshopDate).getTime();
            return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

    // Toggle sort order
    public toggleSortOrder() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        this.sortWorkshopsByDate();
    }

    // Get safe background style with proper error handling
    getBackgroundStyle(workshop: workshopModel): SafeStyle {
        const imageUrl = `${this.imageBaseUrl}${workshop.imageName}`;
        return this.sanitizer.bypassSecurityTrustStyle(`url(${imageUrl})`);
    }

    public async deleteWorkshop(workshopId: string) {
        try{
            const sure = confirm("Are you sure you want to delete this workshop?");
            if (!sure) return;
            await this.workshopService.deleteWorkshop(workshopId);
            this.notifyService.success("Workshop deleted successfully!");
            this.router.navigateByUrl('/workshops');
            
        }
        catch (err: any) {
            this.notifyService.error(err);
        }
    }

    public async goToWorkshopDetails(workshopId: string) {
      this.router.navigateByUrl(`/workshop/edit/${workshopId}`);
    }

    // Fallback if image fails to load
    handleImageError(workshop: workshopModel): void {
        console.error('Image failed to load:', this.imageBaseUrl + workshop.imageName);
        // You could set a fallback image here
    }
    

    calculateEndTime(startDate: Date): Date {
        if (!startDate) return null;
        
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 3);
        return endDate;
    }

}