import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './services/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers:[
    // Enable zone change detection with event coalescing
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Provide the router with application routes
    provideRouter(routes),

    // Provide the HTTP client with interceptors
    provideHttpClient(withInterceptors([tokenInterceptor]))
  ]
};
