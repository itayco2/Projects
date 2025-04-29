import { Routes } from '@angular/router';
import { AiComponent } from './components/ai-area/ai/ai.component';
import { AboutComponent } from './components/pages-area/about/about.component';
import { HomeComponent } from './components/pages-area/home/home.component';
import { Page404Component } from './components/layout-area/page404/page404.component';

export const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: HomeComponent },
    { path: "ai", component: AiComponent },
    { path: "about", component: AboutComponent },
    { path: "**", component: Page404Component }
];
