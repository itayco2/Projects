import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserStore } from '../../../storage/user-store';
import { UserService } from '../../../services/user.service';
import { NotifyService } from '../../../services/notify.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-menu',
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
    
    // Flag to indicate if the user can see progress
    public canSeeProgress: boolean = false;
    
    // Flag to indicate if the menu is open
    public isMenuOpen: boolean = false;
    
    // Subscription to auth service roles
    private rolesSubscription: Subscription;

    ngOnInit(): void {
        // Get user roles and set canSeeProgress flag
        const roles = this.authService.getUserRoles();
        this.canSeeProgress = roles.includes('Student');
        
        // Subscribe to roles changes
        this.rolesSubscription = this.authService.roles$.subscribe(roles => {
            this.canSeeProgress = roles.includes('Student');
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from roles changes
        if (this.rolesSubscription) {
            this.rolesSubscription.unsubscribe();
        }
    }

    // Method to toggle the menu open/close state
    toggleMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;
    }

    // Method to log out the user
    public logOut(): void {
        localStorage.clear();
        this.userService.logout();
        this.notifyService.success("Have a nice day!");
        this.router.navigate(['/home']).then(() => {
            // Additional actions after navigation if needed
        });
    }
}