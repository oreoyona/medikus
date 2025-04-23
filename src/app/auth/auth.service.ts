import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { role, User } from '../common/infercaces';
import { BehaviorSubject, catchError, concatMap, from, map, Observable, of, switchMap, tap, throwError, timer } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { baseUrl } from '../urls';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  route = inject(Router)
  roles: role[] = ["admin", "editor", "subscriber", "instructor"]

  // API URLs

  private readonly apiUrl = baseUrl + 'auth/inscription'
  private readonly apiUrlLogin = baseUrl + 'auth/login'
  private readonly adminUserUrl = baseUrl + 'auth/admin/create_user'
  readonly refreshUrl = baseUrl + 'auth/refresh'
  private redirectUrl: string | null = null;
  private readonly userProgressUrl = baseUrl + "users/progress/"


  //properties to determine the current user and its jwt tokens

  currentUserSubject: BehaviorSubject<User | null>;
 

  public currentUser: User | null;

  tokenRefreshSubject = new BehaviorSubject<boolean>(false); // Track token refresh status
  currentAcessTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(this.getAccessTokenFromLocalStorage());
  refreshAccessTokenSubject = new BehaviorSubject<string>(this.getRefreshTokenFromLocalStorage())

  isAuthenticated = signal(!!this.getAccessTokenFromLocalStorage())
  
  
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient,  private dbService: NgxIndexedDBService) {

    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
    this.currentUser = this.currentUserSubject.value;

    this.currentAcessTokenSubject.subscribe(() => {
      this.isAuthenticated.set(!!this.getAccessTokenFromLocalStorage());
    })
    this.refreshAccessTokenSubject = new BehaviorSubject<string>(this.getRefreshTokenFromLocalStorage())


  }


 /**
  * @param courses An array of courses to which the user is subscribed
  * 
  */

 updateUserCourses(courses: number[]) {
  if (this.currentUser) {
      this.currentUser.courses = courses;
      this.currentUserSubject.next(this.currentUser);
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }
}



  /**
   * get the refresh token from the local storage
   */
  get refresh_token() {
    return localStorage.getItem("refresh_token")
  }



  /**
   * 
   * @returns A [User] object if found in the local storage
   */
  private getUserFromLocalStorage(): User | null {
    // Retrieve user data from local storage or your authentication storage
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }


  /**
   * Gets the access_token from the local storage
   * @returns the string or an empty string
   */

  getAccessTokenFromLocalStorage(): string {
    const tokenStr = localStorage.getItem('access_token');
    return tokenStr ? tokenStr : ""
  }


  getRefreshTokenFromLocalStorage(): string {
    const tokenStr = localStorage.getItem('refresh_token');
    return tokenStr ? tokenStr : ""
  }

  // updateCurrentUserLocalStorage(user: User):void{
  //   localStorage.setItem('currentUser', JSON.stringify(user));
  // }







  /**
   * 
   * @returns wether or not the current user has admin privileges
   */
  isAdmin() {
    // Check if the current user is an admin
    return this.currentUser && this.currentUser.role === 'admin';
  }

  // /**
  //  * 
  //  * @returns true if the user is indeed authenticated
  //  */

  // isAuthenticated(): boolean {
  //   return !!this.currentUser; // Returns true if the user is logged in
  // }

  /**
   * Method to use to get the id from the url
   * @returns the last digit of a url
   */
  getLastUrlStr() {
    return this.route.url.split("/")[2];
  }
  /**
   * 
   * @param user the from to be sent to the server
   * @returns An observable containing the server response
   */
  sendForm(user: any) {
    return this.http.post(this.apiUrl, user)

  }

  /**
   * Similar to sendForm(user) but this method creates users with admin privileges
   * @param user user the from to be sent to the server
   * @returns An observable containing the server response
   */

  createUser(user: any) {
    return this.http.post(this.adminUserUrl, user);
  }

  /**
   * Refreshes the JWT token. 
   * This method works with the authInterceptor function to ensure persistent login in
   * @returns An observable 
   */
  refreshAccessToken(): Observable<any> {

    const refreshToken = this.refreshAccessTokenSubject.value;
    //make sure that the refresh token is indeed valid or not
    setTimeout(() => {
      if (!refreshToken) {
        return throwError(() => new Error("No refresh token available"));
      }
      return
    }, 10)
    //else make the call and wait for the response
    return this.http.post<{ access_token: string }>(
      this.refreshUrl, //the url for to post request
      {}, //an empty body
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        } //the required header for refreshing
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          this.currentAcessTokenSubject.next(response.access_token);
          this.tokenRefreshSubject.next(true); // Notify that the token has been refreshed
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to refresh access token:', error);
          this.logout(); // Log out on refresh failure
          return throwError(() => error);
        })
      );
  }


  startTokenRefreshTimer(): void {
    // Start a timer to check the token expiration every 4 minutes
    timer(0, 240000).subscribe(() => {
      const token = this.currentAcessTokenSubject.value;
      const expirationTime = this.getJwtExpirationTime(token);
      if (expirationTime && expirationTime.getTime() - Date.now() < 60000) {

        // Refresh the token if it's going to expire in less than 1 minute
        this.refreshAccessToken().subscribe(e => {
          
        });


      }
    });
  }





  /**
   * 
   * @param form the user form to send to the server
   * @returns An observable containing the server response
   */
  logInUser(form: any) {
    return this.http.post<{ access_token: string; refresh_token: string; user: User }>(this.apiUrlLogin, form)
    .pipe(
      tap(()=>{
        this.authStatusSubject.next(true); // Notify subscribers
      })
    )
  }
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Logs out the user and reload the app
   */

  logout(courseId?: number): void {
    let sendProgressObservable: Observable<any> | null = null;
    const refreshToken = localStorage.getItem('refresh_token');

    if (courseId !== undefined) {
      sendProgressObservable = this.sendUserProgressToBackend(courseId);
    }

    const logoutSequence$ = (progressResult: any) => {
      if (!refreshToken) {
        console.warn('No refresh token found during logout.');
        // Proceed with client-side logout even if no refresh token
        return of(null).pipe(
          tap(() => this.clearClientSideData())
        );
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${refreshToken}`
      });

      return this.http.delete(`${baseUrl}auth/revoke_refresh`, { headers }).pipe(
        catchError(error => {
          console.error('Error revoking refresh token:', error);
          // Proceed with client-side logout even if revocation fails
          return of(null);
        }),
        tap((refreshResult) => {
          console.log('Refresh token revocation successful:', refreshResult);
        }),
        concatMap(() =>
          this.http.delete(`${baseUrl}auth/revoke_access`).pipe(
            catchError(error => {
              console.error('Error revoking access token:', error);
              return of(null);
            }),
            map((accessResult) => ({ accessResult })),
            tap(({ accessResult }) => {
              this.clearClientSideData();
            })
          )
        )
      );
    };

    const finalLogout$ = sendProgressObservable ?
      sendProgressObservable.pipe(
        concatMap(() => logoutSequence$(null)),
        catchError(error => {
          console.error('Error sending user progress:', error);
          return logoutSequence$(null); // Still attempt logout
        })
      ) :
      logoutSequence$(null);

    finalLogout$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private clearClientSideData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next({ id: "" } as User);
    this.currentUser = { id: "" };
    this.isAuthenticated.set(false);
    this.route.navigate(["/"]);
    window.location.reload();
  }
  private sendUserProgressToBackend(courseId: number): Observable<any> {
    return from(this.dbService.getAll('userProgress')).pipe(
      switchMap(userProgressData => {
        return this.http.post(`${this.userProgressUrl}/${courseId}`, { userProgress: userProgressData });
      })
    );
  }



  /**
   * Sets the URL to which the user should be redirected after successful authentication.
   *
   * @param url The URL to redirect to.
   */
  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  /**
   * Retrieves the URL to which the user should be redirected.
   *
   * @returns The redirect URL, or null if no redirect URL has been set.
   */
  getRedirectUrl(): string | null {
    const tempUrl = this.redirectUrl;
    this.redirectUrl = null; // Clear the redirect URL after retrieval
    return tempUrl;
  }






  /**
   * Verify the expiratory time of a given token
   * @param token the JWT token
   * @returns a date object or null
   */
  getJwtExpirationTime(token: string): Date | null {
    try {
      const payloadBase64Url = token.split('.')[1];
      if (!payloadBase64Url) {
        return null; // Invalid token format
      }

      const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - (payloadBase64.length % 4)) % 4);
      const payloadJson = atob(payloadBase64 + padding);
      const payload = JSON.parse(payloadJson);

      if (payload && typeof payload.exp === 'number') {
        return new Date(payload.exp * 1000); // Convert seconds to milliseconds
      } else {
        return null; // Expiration time not found in payload
      }
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null; // Error decoding or parsing token
    }
  }



  ///VALIDATORS

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      return password && confirmPassword && password.value !== confirmPassword.value
        ? { passwordsDoNotMatch: true }
        : null;
    };
  }

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;

      // Vérification des critères
      const hasMinimumLength = password && password.length >= 8;
      const hasLowerCase = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);

      const valid = hasMinimumLength && hasLowerCase && hasDigit;

      return !valid ? { weakPassword: true } : null;
    };
  }

}
