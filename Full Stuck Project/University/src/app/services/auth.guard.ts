import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { NotifyService } from './notify.service';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  // Get the token from local storage
  const token = localStorage.getItem('token');

  if (token) {
    try {
      // Decode the token to get user information
      const decodedToken: any = jwtDecode(token); 
      const userRole = decodedToken.role; 

      // Get the required roles from route data
      const requiredRoles = route.data['roles']; 

      // Check if the user has the required role
      if (requiredRoles && !requiredRoles.includes(userRole)) {
        const notifyService = inject(NotifyService);
        const router = inject(Router);

        notifyService.error('You do not have permission to access this page.');
        router.navigateByUrl('/home');

        return false; 
      }

      return true;
    } catch (error) {
      const notifyService = inject(NotifyService);
      const router = inject(Router);

      notifyService.error('Error decoding the token');
      router.navigateByUrl('/login');
      return false; 
    }
  }

  const notifyService = inject(NotifyService);
  const router = inject(Router);

  notifyService.error('You must be logged in to watch courses.');
  router.navigateByUrl('/login');
  return false;
};
