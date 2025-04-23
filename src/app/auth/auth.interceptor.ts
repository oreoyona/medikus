import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';


/** Responsible for sending refresh token api calls if the access token has expired */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const refreshToken = localStorage.getItem('refresh_token');

      if (err.status === 401 && refreshToken) {
        return http.post(authService.refreshUrl, "", { headers: { Authorization: `Bearer ${refreshToken}` } }).pipe(
          switchMap((res: any) => {
            const newToken = res.access_token;
            localStorage.setItem('access_token', newToken);
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
          }),
          catchError((refreshError) => {
            // authService.logout(); // Handle logout on refresh failure
            console.error(refreshError)
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => err);
    })
  );
};




/** Places an access token auth header to every api calls from the app */

export const authHeaderInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const accessToken =  authService.currentAcessTokenSubject.value || localStorage.getItem('access_token')

  if (accessToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return next(authReq); // Pass the modified request
  }

  return next(req); // Pass the original request if no token
};




