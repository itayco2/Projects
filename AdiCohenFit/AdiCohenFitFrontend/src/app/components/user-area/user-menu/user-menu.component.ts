import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserStore } from '../../../storage/user-store';
import { UserService } from '../../../services/user.service';
import { NotifyService } from '../../../services/notify.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent implements OnInit, OnDestroy {
   
    // Injected services
    public userStore = inject(UserStore);
    public userService = inject(UserService);
    public notifyService = inject(NotifyService);
    public router = inject(Router);
    public authService = inject(AuthService);
    
    // Add ElementRef and Renderer2 for DOM manipulation
    private elementRef = inject(ElementRef);
    private renderer = inject(Renderer2);
    
    // Flag to indicate if the user can see progress
    public canSeeProgress: boolean = false;
    
    // Flag to indicate if the menu is open
    public isMenuOpen: boolean = false;
    
    // Reference to the dropdown element
    private dropdownElement: HTMLElement = null;
    
    // Subscription to auth service roles
    private rolesSubscription: Subscription;

    ngOnInit(): void {
        // Get user roles and set canSeeProgress flag
        const roles = this.authService.getUserRoles();
        this.canSeeProgress = roles.includes('Visitor');
        
        // Subscribe to roles changes
        this.rolesSubscription = this.authService.roles$.subscribe(roles => {
            this.canSeeProgress = roles.includes('Visitor');
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from roles changes
        if (this.rolesSubscription) {
            this.rolesSubscription.unsubscribe();
        }
        
        // Remove dropdown from body if it exists
        if (this.dropdownElement) {
            document.body.removeChild(this.dropdownElement);
        }
    }

    // Method to toggle the menu open/close state
    toggleMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;
        
        if (this.isMenuOpen) {
            this.createDropdownInBody();
        } else if (this.dropdownElement) {
            // Hide the dropdown when menu is closed
            document.body.removeChild(this.dropdownElement);
            this.dropdownElement = null;
        }
    }
    
    // Create dropdown directly in the body
    private createDropdownInBody(): void {
        // Remove existing dropdown if any
        if (this.dropdownElement) {
            document.body.removeChild(this.dropdownElement);
        }
        
        // Create new dropdown element
        this.dropdownElement = this.renderer.createElement('div');
        this.renderer.addClass(this.dropdownElement, 'body-dropdown-menu');
        
        // Add dropdown content with Saved Recipes option
        this.dropdownElement.innerHTML = `
            <div class="dropdown-menu">
                <div class="dropdown-option">
                    <a class="saved-recipes-link"> המתכונים שלי</a>
                </div>
                <div class="dropdown-option">
                    <a class="logout-link">התנתק</a>
                </div>
            </div>
        `;
        
        // Add click event to saved recipes link
        const savedRecipesLink = this.dropdownElement.querySelector('.saved-recipes-link');
        this.renderer.listen(savedRecipesLink, 'click', () => {
            this.navigateToSavedRecipes();
        });
        
        // Add click event to logout link
        const logoutLink = this.dropdownElement.querySelector('.logout-link');
        this.renderer.listen(logoutLink, 'click', () => {
            this.logOut();
        });
        
        // Position the dropdown
        const userMenuElement = this.elementRef.nativeElement.querySelector('.user-info');
        if (userMenuElement) {
            const rect = userMenuElement.getBoundingClientRect();
            
            // Set position styles - adding offset to move down and left
            this.renderer.setStyle(this.dropdownElement, 'position', 'fixed');
            this.renderer.setStyle(this.dropdownElement, 'top', `${rect.bottom + 15}px`); // Move down by 15px
            this.renderer.setStyle(this.dropdownElement, 'right', `${window.innerWidth - rect.right + -30}px`); // Move left by 20px
            this.renderer.setStyle(this.dropdownElement, 'z-index', '99999');
            
            // Add dropdown styling
            this.renderer.setStyle(this.dropdownElement, 'background-color', 'white');
            this.renderer.setStyle(this.dropdownElement, 'border', '1px solid #ccc');
            this.renderer.setStyle(this.dropdownElement, 'border-radius', '4px');
            this.renderer.setStyle(this.dropdownElement, 'box-shadow', '0 4px 12px rgba(0, 0, 0, 0.2)');
            this.renderer.setStyle(this.dropdownElement, 'width', '150px');
            this.renderer.setStyle(this.dropdownElement, 'padding', '10px');
        }
        
        // Add the dropdown to the document body
        document.body.appendChild(this.dropdownElement);
        
        // Create click handler to close dropdown when clicking outside
    setTimeout(() => {
         const clickHandler = (event: MouseEvent) => {
        if (this.dropdownElement && 
            !this.dropdownElement.contains(event.target as Node) && 
            !this.elementRef.nativeElement.contains(event.target as Node)) {
            this.isMenuOpen = false;
            document.body.removeChild(this.dropdownElement);
            this.dropdownElement = null;
            document.removeEventListener('click', clickHandler);
        }
    };
    document.addEventListener('click', clickHandler);
    });
    }

    // Navigate to saved recipes page
    public navigateToSavedRecipes(): void {
        this.isMenuOpen = false;
        if (this.dropdownElement) {
            document.body.removeChild(this.dropdownElement);
            this.dropdownElement = null;
        }
        this.router.navigate(['/saved-recipes']);
    }

    // Method to log out the user
    public logOut(): void {
        localStorage.clear();
        this.userService.logout();
        this.notifyService.success("!שיהיה לך המשך יום נעים");
        this.router.navigate(['/home']);
    }
}