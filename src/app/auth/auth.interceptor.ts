import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const setHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const newReq = req.clone({setHeaders: authService.getAuthHeader()})
  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if(error.status == 401){
        authService.refreshAccessToken()
      }

      return next(req)
      
    })
  )
}


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
            authService.logout(); // Handle logout on refresh failure
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
