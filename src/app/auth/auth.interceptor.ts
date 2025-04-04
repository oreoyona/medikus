import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpHeaders, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, finalize, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

// /**
//  * Passes a new header to every http requests of the app
//  * @param req the request object
//  * @param next the handler function
//  * @returns HttpInterceptorFn
//  */
// export const setHeaderInterceptor: HttpInterceptorFn = (req, next) => {
//   //set the headers for all http requests
//   let token = localStorage.getItem("access_token")
//   const newReq = req.clone({setHeaders: {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}`
//   }})
//   return next(newReq)
// }


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




