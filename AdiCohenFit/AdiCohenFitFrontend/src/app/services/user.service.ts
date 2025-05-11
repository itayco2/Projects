import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserStore } from '../storage/user-store';
import { jwtDecode } from 'jwt-decode';
import { UserModel } from '../models/user.model';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { CredentialsLoginModel, CredentialsModel } from '../models/credentials.model';
import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    // Injected services
    private httpClient = inject(HttpClient);
    private userStore = inject(UserStore);
    private authService = inject(AuthService);
    private notifyService = inject(NotifyService);

    public constructor() {
        const token = localStorage.getItem("token");
        if(!token) return;
        
        try {
            const payload = jwtDecode<{ user: UserModel }>(token);
            
            // Verify the token contains user information
            if (!payload || !payload.user || !payload.user.id) {
                console.error('Invalid token format - missing user or user.id');
                this.logout();
                return;
            }
            
            const dbUser = payload.user;
            this.userStore.initUser(dbUser);
            
            // Make sure AuthService knows about the token on initialization
            this.authService.setToken(token);
        } catch (error) {
            console.error('Error decoding token during initialization:', error);
            this.logout();
        }
    }

    // Method to register a new user
    public async register(user: UserModel): Promise<void> {
        try {
            // Send registration request to the backend and get the token
            const token$ = this.httpClient.post<string>(environment.registerUrl, user, { responseType: 'text' as 'json' });
            const token = await firstValueFrom(token$);

            // Verify token is valid before using it
            if (!token) {
                throw new Error('אירעה שגיאה בהרשמה - לא התקבל טוקן');
            }

            try {
                // Decode the token to get user information
                const payload = jwtDecode<{ user: UserModel }>(token);
                
                // Verify the token contains user information
                if (!payload || !payload.user || !payload.user.id) {
                    throw new Error('אירעה שגיאה באימות המשתמש');
                }
                
                const dbUser = payload.user;

                // Initialize the user store with the user information
                this.userStore.initUser(dbUser);

                // Store the token in local storage
                localStorage.setItem("token", token);

                // Update AuthService with the new token
                this.authService.setToken(token);
            } catch (error) {
                console.error('Error decoding token after registration:', error);
                throw new Error('אירעה שגיאה באימות המשתמש');
            }
        } catch (error: any) {
            // Check if error has a message property and properly extract it
            let errorMessage = "ההרשמה נכשלה";
            if (error.error) {
                try {
                    // Try to parse the error if it's a JSON string
                    const parsedError = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
                    errorMessage = parsedError.message || "ההרשמה נכשלה";
                } catch {
                    errorMessage = error.error || "ההרשמה נכשלה";
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    }

    // Method to login a user
    public async login(credentials: CredentialsLoginModel): Promise<void> {
        try {
            // Send login request to the backend and get the token
            const token$ = this.httpClient.post<string>(environment.loginUrl, credentials, { responseType: 'text' as 'json' });
            const token = await firstValueFrom(token$);

            // Verify token is valid before using it
            if (!token) {
                throw new Error('אירעה שגיאה בהתחברות - לא התקבל טוקן');
            }

            try {
                // Decode the token to get user information
                const payload = jwtDecode<{ user: UserModel }>(token);
                
                // Verify the token contains user information
                if (!payload || !payload.user || !payload.user.id) {
                    throw new Error('אירעה שגיאה באימות המשתמש');
                }
                
                const dbUser = payload.user;

                // Initialize the user store with the user information
                this.userStore.initUser(dbUser);

                // Store the token in local storage
                localStorage.setItem("token", token);

                // Update AuthService with the new token
                this.authService.setToken(token);
            } catch (error) {
                console.error('Error decoding token after login:', error);
                throw new Error('אירעה שגיאה באימות המשתמש');
            }
        } catch (error: any) {
            // Check if error has a message property and properly extract it
            let errorMessage = "התחברות נכשלה";
            if (error.error) {
                try {
                    // Try to parse the error if it's a JSON string
                    const parsedError = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
                    errorMessage = parsedError.message || "התחברות נכשלה";
                } catch {
                    errorMessage = error.error || "התחברות נכשלה";
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    }

    // Method to logout a user
    public logout(): void {
        this.userStore.logoutUser();
        this.authService.logout();
        localStorage.removeItem("token");
    }

    // Method to get current user ID
    public getCurrentUserId(): string | null {
        return this.authService.getUserId();
    }
}