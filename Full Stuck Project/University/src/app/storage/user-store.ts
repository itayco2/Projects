import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { UserModel } from "../models/user.model";
import { computed } from "@angular/core";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { environment } from "../../environments/environment";

export type UserState = {
    user: UserModel | null;
};

const initialState: UserState = {
    user: null
};

export const UserStore = signalStore(
    { providedIn: "root" },
    
    // Initialize the store with the initial state
    withState(initialState),

    // Define methods to manipulate the store
    withMethods(store => ({

        // Method to initialize the user store with a user
        initUser(user: UserModel): void {
            try {
                patchState(store, _currentState => ({ user: user as UserModel }));
            } catch (error) {
                console.error("Failed to initialize user:", error);
            }
        },

        // Method to log out the user
        logoutUser(): void {
            try {
                patchState(store, _currentState => ({
                     user: null as UserModel }));
            } catch (error) {
                console.error("Failed to logout user:", error);
            }
        }
    })),

    // Create computed values
    withComputed(store => ({
        // Computed value to get the full name of the user
        fullname: computed(() => `${store.user()?.name}`)
    })),

    // Adding reports to debug tool
    environment.isDevelopment && withDevtools("UserStore")
);