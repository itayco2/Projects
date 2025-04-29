import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { environment } from "../../environments/environment";
import { EnrollmentModel } from "../models/enrollment.model";

export type EnrollmentState = {
    enrollments: EnrollmentModel[];
};

const initialState: EnrollmentState = {
    enrollments: []
};

export const EnrollmentStore = signalStore(
    { providedIn: "root" },
    
    // Initialize the store with the initial state
    withState(initialState),

    // Define methods to manipulate the store
    withMethods(store => ({

        // Method to add a new enrollment to the store
        addEnrollment(enrollment: EnrollmentModel): void {
            patchState(store, currentState => ({ enrollments: [...currentState.enrollments, enrollment] }));
        },

        // Method to delete an enrollment from the store by ID
        deleteEnrollment(id: string): void {
            patchState(store, currentState => ({ enrollments: currentState.enrollments.filter(c => c.id !== id) }));
        }

    })),

    // Create computed values
    withComputed(store => ({
        count: computed(() => store.enrollments().length),
    })),

    // Adding reports to debug tool
    environment.isDevelopment && withDevtools("EnrollmentStore")
);