import { computed } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { environment } from "../../environments/environment";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { ProgressModel } from "../models/progress.model";

export type ProgressState = {
    progress: ProgressModel[];
};

const initialState: ProgressState = {
    progress: [] as ProgressModel[], // Explicitly typing the array
};

export const ProgressStore = signalStore(
    { providedIn: "root" },

    // Initialize the store with the initial state
    withState(initialState),

    // Define methods to manipulate the store
    withMethods(store => ({

        // Method to clear all progress
        clearProgress(): void {
            patchState(store, _ => ({ progress: [] as ProgressModel[] }));
        }
    })),

    // Create computed values
    withComputed(store => ({
        // Computed value to get the count of progress entries
        count: computed(() => store.progress().length),

        // Computed value to get the IDs of completed lessons
        completedLessonIds: computed(() => 
            store.progress().map(progress => progress.lessonId) 
        ),
    })),

    // Adding reports to debug tool
    environment.isDevelopment && withDevtools("ProgressStore")
);
