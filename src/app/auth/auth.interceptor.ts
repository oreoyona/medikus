import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';





/** Responsible for sending refresh token api calls if the access token has expired */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const http = inject(HttpClient);
  const authService = inject(AuthService);

  // Use a local variable within the interceptor's scope to manage refresh state
  let isRefreshing = false;
  const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Check for 401 status and if it's not a refresh token request itself
      if (err.status === 401 && !req.url.includes(authService.refreshUrl)) {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          // No refresh token, log out the user
          authService.logout();
          return throwError(() => err);
        }

        if (isRefreshing) {
          // If a token refresh is already in progress,
          // wait for the new token and then retry the original request.
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => {
              return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
            })
          );
        }

        isRefreshing = true;
        refreshTokenSubject.next(null); // Clear the token subject to prevent old tokens from being used

        // Attempt to refresh the token
        return http.post<{ access_token: string }>(authService.refreshUrl, "", { headers: { Authorization: `Bearer ${refreshToken}` } }).pipe(
          switchMap((res) => {
            const newToken = res.access_token;
            localStorage.setItem('access_token', newToken);
            authService.currentAcessTokenSubject.next(localStorage.getItem('access_token'))
          
            isRefreshing = false; // Reset the flag on successful refresh
            refreshTokenSubject.next(newToken); // Emit the new token

            // Retry the original request with the new access token
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
          }),
          catchError((refreshError) => {
            // Refresh token failed, log out the user
            authService.logout();
            isRefreshing = false; // Reset the flag on refresh failure
            refreshTokenSubject.next(null); // Ensure subject is cleared
            return throwError(() => refreshError);
          }),
          finalize(() => {
            // Ensure isRefreshing is reset regardless of success or failure
            isRefreshing = false;
          })
        );
      }

      // For other errors or if no refresh token exists, re-throw the error
      return throwError(() => err);
    })
  );
};


