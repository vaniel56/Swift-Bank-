import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service'; // Your service

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if the user is logged in
  if (authService.isAuthenticated()) {
    return true; // User is authenticated, allow access
  }

  // Not authenticated: redirect to the login page
  // Using router.parseUrl or router.createUrlTree is the preferred way
  return router.parseUrl('/login');
};
