import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { workshopModel } from "../models/workshop.model";
import { computed } from "@angular/core";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { environment } from "../../environments/environment.development";

export type WorkshopState = {
    workshops : workshopModel[];
};

const initialState: WorkshopState = {
    workshops: []
};

export const workshopStore = signalStore(
    {providedIn: "root"},

    withState(initialState),

    withMethods(store =>({
        initWorkshops(workshops: workshopModel[]) : void {
            patchState(store, _currentState => ({workshops}));
        },
        addWorkshop(workshop: workshopModel) : void {
            patchState(store, currentState => ({workshops: [...currentState.workshops, workshop]}));
        },
        updateWorkshop(workshop: workshopModel) : void {
            patchState(store, currentState => ({workshops: currentState.workshops.map(w => w.id === workshop.id ? workshop : w)}));
        },
        deleteWorkshop(id : string) : void {
            patchState(store, currentState => ({workshops: currentState.workshops.filter(w => w.id !== id)}));
        }

    })),
    // Create computed values
    withComputed(store => ({
        count: computed(() => store.workshops().length),
    })),

    // Adding reports to debug tool
    environment.isDevelopment && withDevtools("workshopStore")
)