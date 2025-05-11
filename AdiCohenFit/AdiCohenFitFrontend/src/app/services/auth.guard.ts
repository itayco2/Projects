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
      const exp = decodedToken.exp; // Expiration time in the token

      // Check if the token has expired
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (exp < currentTime) {
        const notifyService = inject(NotifyService);
        const router = inject(Router);

        notifyService.error('Your session has expired. Please log in again.');
        localStorage.removeItem('token'); // Clear the expired token
        router.navigateByUrl('/login');
        return false;
      }

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

  notifyService.error('You do not have permission to access this page.');
  router.navigateByUrl('/home');
  return false;
};
