import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Cached roles of the user
  private cachedRoles: string[] | null = null;
  
  // BehaviorSubject to track roles
  private rolesSubject = new BehaviorSubject<string[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  constructor() {
    // Initialize roles on service creation
    const storedRoles = localStorage.getItem('roles');
    if (storedRoles) {
      const roles = JSON.parse(storedRoles);
      this.cachedRoles = roles;
      this.rolesSubject.next(roles);
    } else if (localStorage.getItem('token')) {
      const roles = this.decodeToken();
      this.rolesSubject.next(roles);
    }
  }

  // Method to decode the token and extract roles
  private decodeToken(): string[] {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const roles = decodedToken?.user?.role ? [decodedToken.user.role] : [];
        localStorage.setItem('roles', JSON.stringify(roles));
        this.cachedRoles = roles;
        return roles;
      } catch (error) {
        console.error('Error decoding token:', error);
        return [];
      }
    }
    return [];
  }

  // Method to get user roles
  public getUserRoles(): string[] {
    if (this.cachedRoles === null) {
      const storedRoles = localStorage.getItem('roles');
      if (storedRoles) {
        this.cachedRoles = JSON.parse(storedRoles);
      } else {
        this.cachedRoles = this.decodeToken();
      }
      // Update the BehaviorSubject
      this.rolesSubject.next(this.cachedRoles);
    }
    return this.cachedRoles;
  }

  // Method to check if the user has a required role
  public hasRole(requiredRoles: string[]): boolean {
    const roles = this.getUserRoles();
    return requiredRoles.some(role => roles.includes(role));
  }

  // Method to clear the roles cache
  public clearRolesCache(): void {
    this.cachedRoles = null;
    localStorage.removeItem('roles');
    this.rolesSubject.next([]);
  }

  // Method to log out the user
  public logout(): void {
    this.clearRolesCache();
    localStorage.removeItem('token');
  }

  // Method to set a new token and update roles
  public setToken(token: string): void {
    localStorage.setItem('token', token);
    this.clearRolesCache();
    
    // Immediately decode and update roles when setting a new token
    const roles = this.decodeToken();
    this.rolesSubject.next(roles);
  }
}