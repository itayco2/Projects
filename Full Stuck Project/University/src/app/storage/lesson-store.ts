import { computed } from "@angular/core";
import { LessonModel } from "../models/lesson.model"
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { environment } from "../../environments/environment";
import { withDevtools } from "@angular-architects/ngrx-toolkit";

export type LessonState = {
    lessons: LessonModel[];
};

const initialState: LessonState = {
    lessons: []
};

export const LessonStore = signalStore(
    { providedIn: "root" },

    // Initialize the store with the initial state
    withState(initialState),
    
    // Define methods to manipulate the store
    withMethods(store => ({

        // Method to initialize the lesson store with fetched lessons
        initLessons(lessons: LessonModel[]): void {
            patchState(store, _currentState => ({ lessons }));   
        },

        // Method to add a new lesson to the store
        addLesson(lesson: LessonModel): void {
            patchState(store, currentState => ({ lessons: [...currentState.lessons, lesson] }));
        },
        
        // Method to update a lesson in the store
        updateLesson(lesson: LessonModel): void {
            patchState(store, currentState => ({ lessons: currentState.lessons.map(l => l.id === lesson.id ? lesson : l) }));
        },

        // Method to delete a lesson from the store by ID
        deleteLesson(id: string): void {
            patchState(store, currentState => ({ lessons: currentState.lessons.filter(l => l.id !== id) }));
        }
   
    })),

    // Create computed values
    withComputed(store => ({
        count: computed(() => store.lessons().length),
    })),

    // Adding reports to debug tool
    environment.isDevelopment && withDevtools("LessonStore")
);