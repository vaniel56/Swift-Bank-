import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Valid, non-expired token → allow access.
  if (authService.isAuthenticated()) {
    return true;
  }

  // Not authenticated: remember where the user was going and send them to login.
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Redirects already-logged-in users away from the login/register pages. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? router.createUrlTree(['/layout/home']) : true;
};
