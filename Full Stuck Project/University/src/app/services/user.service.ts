import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserStore } from '../storage/user-store';
import { jwtDecode } from 'jwt-decode';
import { UserModel } from '../models/user.model';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { CredentialsLoginModel, CredentialsModel } from '../models/credentials.model';
import { ProgressStore } from '../storage/progress-store';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    // Injected services
    private httpClient = inject(HttpClient);
    private userStore = inject(UserStore);
    private progressStore = inject(ProgressStore);
    private authService = inject(AuthService);

    public constructor() {
        const token = localStorage.getItem("token");
        if(!token) return;
        const payload = jwtDecode<{ user: UserModel }>(token);
        const dbUser = payload.user;
        this.userStore.initUser(dbUser);
        // Make sure AuthService knows about the token on initialization
        this.authService.setToken(token);
    }

    // Method to register a new user
    public async register(user: UserModel): Promise<void> {
        try {
            // Send registration request to the backend and get the token
            const token$ = this.httpClient.post<string>(environment.registerUrl, user, { responseType: 'text' as 'json' });
            const token = await firstValueFrom(token$);

            // Decode the token to get user information
            const payload = jwtDecode<{ user: UserModel }>(token);
            const dbUser = payload.user;

            // Initialize the user store with the user information
            this.userStore.initUser(dbUser);

            // Store the token in local storage
            localStorage.setItem("token", token);

            // Update AuthService with the new token
            this.authService.setToken(token);
        } catch (error: any) {
            // Check if error has a message property and properly extract it
            let errorMessage = "Registration failed";
            if (error.error) {
                try {
                    // Try to parse the error if it's a JSON string
                    const parsedError = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
                    errorMessage = parsedError.message || "Registration failed";
                } catch {
                    errorMessage = error.error || "Registration failed";
                }
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

            // Decode the token to get user information
            const payload = jwtDecode<{ user: UserModel }>(token);
            const dbUser = payload.user;

            // Initialize the user store with the user information
            this.userStore.initUser(dbUser);

            // Store the token in local storage
            localStorage.setItem("token", token);

            // Update AuthService with the new token
            this.authService.setToken(token);
        } catch (error: any) {
            // Check if error has a message property and properly extract it
            let errorMessage = "Login failed";
            if (error.error) {
                try {
                    // Try to parse the error if it's a JSON string
                    const parsedError = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
                    errorMessage = parsedError.message || "Login failed";
                } catch {
                    errorMessage = error.error || "Login failed";
                }
            }
            throw new Error(errorMessage);
        }
    }

    // Method to logout a user
    public logout(): void {
        this.userStore.logoutUser();
        this.progressStore.clearProgress();
        this.authService.logout();
        localStorage.removeItem("token");
    }
}