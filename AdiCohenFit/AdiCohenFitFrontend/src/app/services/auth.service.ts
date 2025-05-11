import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Cached roles of the user
  private cachedRoles: string[] | null = null;
  
  // BehaviorSubject to track roles
  private rolesSubject = new BehaviorSubject<string[]>([]);
  public roles$ = this.rolesSubject.asObservable();
  
  // BehaviorSubject to track authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Initialize authentication state on service creation
    const token = localStorage.getItem('token');
    if (token && this.isTokenValid(token)) {
      this.isAuthenticatedSubject.next(true);
      
      // Initialize roles
      const storedRoles = localStorage.getItem('roles');
      if (storedRoles) {
        const roles = JSON.parse(storedRoles);
        this.cachedRoles = roles;
        this.rolesSubject.next(roles);
      } else {
        const roles = this.decodeToken();
        this.rolesSubject.next(roles);
      }
    } else {
      // Clear any invalid tokens
      if (token && !this.isTokenValid(token)) {
        this.logout();
      }
      this.isAuthenticatedSubject.next(false);
    }
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }

  // Get the current token
  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get the user ID from the token
  public getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decodedToken: any = jwtDecode(token);
      // Check various common formats for user ID in tokens
      return decodedToken.sub || decodedToken.userId || 
             (decodedToken.user ? decodedToken.user.id : null) || 
             decodedToken.id || null;
    } catch (error) {
      console.error('Error getting user ID from token:', error);
      return null;
    }
  }

  // Check if token is valid (not expired)
  private isTokenValid(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  // Method to decode the token and extract roles
  private decodeToken(): string[] {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        
        // Try to extract roles from common formats
        let roles: string[] = [];
        
        if (decodedToken.role) {
          // Single role as string
          roles = [decodedToken.role];
        } else if (decodedToken.roles && Array.isArray(decodedToken.roles)) {
          // Array of roles
          roles = decodedToken.roles;
        } else if (decodedToken.user?.role) {
          // Nested role in user object
          roles = [decodedToken.user.role];
        } else if (decodedToken.user?.roles && Array.isArray(decodedToken.user.roles)) {
          // Nested array of roles in user object
          roles = decodedToken.user.roles;
        }
        
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
    this.isAuthenticatedSubject.next(false);
  }

  // Method to set a new token and update roles
  public setToken(token: string): void {
    localStorage.setItem('token', token);
    this.clearRolesCache();
    
    // Immediately decode and update roles when setting a new token
    const roles = this.decodeToken();
    this.rolesSubject.next(roles);
    
    // Update authentication state
    this.isAuthenticatedSubject.next(true);
  }
}