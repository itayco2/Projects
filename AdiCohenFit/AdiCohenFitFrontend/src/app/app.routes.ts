import { Routes } from '@angular/router';
import { HomeComponent } from './components/page-area/home/home.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch:"full" },
    { path: "home", component: HomeComponent},
    { path: "contact-us", loadComponent: () => import("./components/page-area/contact-us/contact-us.component").then(c => c.ContactUsComponent) },
    { path: "nutrition", loadComponent: () => import("./components/nutrition-area/nutrition/nutrition.component").then(m => m.NutritionComponent) },
    { path: "workshops",loadComponent : () => import("./components/workshop-area/workshop-list/workshop-list.component").then(m => m.WorkshopListComponent) },
    { path: "workshop/new",loadComponent : () => import("./components/workshop-area/workshop-new/workshop-new.component").then(m => m.WorkshopNewComponent), canActivate: [authGuard], data: { roles: ["Admin"] } },
    { path: "workshop/edit/:id",loadComponent : () => import("./components/workshop-area/workshop-edit/workshop-edit.component").then(m => m.WorkshopEditComponent), canActivate: [authGuard], data: { roles: ["Admin"] } },
    { path: "workshop/purchase/:id",loadComponent : () => import("./components/workshop-area/register/register.component").then(m => m.RegisterComponent) },
    { path: "suggestion",loadComponent : () => import("./components/page-area/suggestion/suggestion.component").then(m => m.SuggestionComponent) },

    { path: "register", loadComponent: () => import("./components/user-area/register/register.component").then(m => m.RegisterComponent) }, 
    { path: "login", loadComponent: () => import("./components/user-area/login/login.component").then(m => m.LoginComponent) },
    

    { path: "**", loadComponent: () => import("./components/page-area/page404/page404.component").then(m => m.Page404Component) }

];
