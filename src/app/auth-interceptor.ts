import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const hadSession = !!token;

  // If the stored token is already expired, end the session and send the user to login.
  if (token && authService.isTokenExpired(token)) {
    authService.logout();
    redirectToLogin(router);
    return throwError(
      () => new HttpErrorResponse({ status: 401, statusText: 'Session expired.' })
    );
  }

  // Attach the JWT to every outgoing request.
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      // The server rejected our token — clear the session and go back to login.
      // (Login/register failures with 401 are NOT redirected: hadSession is false.)
      if (error instanceof HttpErrorResponse && error.status === 401 && hadSession) {
        authService.logout();
        redirectToLogin(router);
      }
      return throwError(() => error);
    })
  );
};

function redirectToLogin(router: Router): void {
  if (router.url.startsWith('/login')) {
    return;
  }
  router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
}
