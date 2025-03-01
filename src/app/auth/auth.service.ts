import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { role, User } from '../common/infercaces';
import { BehaviorSubject, catchError, filter, finalize, Observable, of, retry, Subject, switchMap, take, tap, throwError } from 'rxjs';


export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const token = localStorage.getItem('access_token');


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  route = inject(Router)

  roles: role[] = [
    "admin",
    "editor",
    "subscriber",
    "instructor"
  ]
  // API URLs
  
  private readonly apiUrl = 'http://localhost:5000/api/v1/auth/inscription'
  private readonly apiUrlLogin = 'http://localhost:5000/api/v1/auth/login'
  private readonly adminUserUrl = 'http://localhost:5000/api/v1/auth/admin/create_user'
  private readonly allTheUsersApiUrl = 'http://localhost:5000/api/v1/users'
  readonly refreshUrl = 'http://localhost:5000/api/v1/auth/refresh'
  private isRefreshing = false;

  //properties to determine the current user and its jwt tokens

  currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: User | null;

  tokenRefreshSubject = new BehaviorSubject<boolean>(false); // Track token refresh status
  currentAcessTokenSubject: any;

  refreshAccessTokenSubject: any
  
  constructor(private http: HttpClient) { 
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
    this.currentUser = this.currentUserSubject.value;

    this.currentAcessTokenSubject = new BehaviorSubject<String>(this.getAccessTokenFromLocalStorage())
    this.refreshAccessTokenSubject = new BehaviorSubject<String>(this.getRefreshTokenFromLocalStorage())


   
  }




/**
 * get the refresh token from the local storage
 */
  get refresh_token(){
    return localStorage.getItem("refresh_token")
  }



  /**
   * 
   * @returns A [User] object if found in the local storage
   */
  private getUserFromLocalStorage(): User {
    // Retrieve user data from local storage or your authentication storage
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }


  /**
   * Gets the access_token from the local storage
   * @returns the string or an empty string
   */

  getAccessTokenFromLocalStorage(): String{
    const tokenStr = localStorage.getItem('access_token');
    return tokenStr ? tokenStr: ""
  }


  getRefreshTokenFromLocalStorage(): String{
    const tokenStr = localStorage.getItem('refresh_token');
    return tokenStr ? tokenStr: ""
  }

  /**
   * 
   * @returns an array of users if the user making the resquest has the required authorization
   */
  getAllUsers() {

    return this.http.get<any[]>(this.allTheUsersApiUrl, {headers: this.getAuthHeader()});
  }

  /**
   * 
   * @returns an object with the token as an authorization value
   */
 getAuthHeader(token?: string){
  
  return token?{'Authorization': `Bearer ${this.currentAcessTokenSubject.value}`}: this.currentAcessTokenSubject.value? {'Authorization': `Bearer ${this.currentAcessTokenSubject.value}`}: {'Authorization': 'Bearer invalid'}
 }

// 7!2!59!8@M@gou


 /**
  * 
  * @returns wether or not the current user has admin privileges
  */
  isAdmin(){
    // Check if the current user is an admin
    return this.currentUser && this.currentUser.role === 'admin'; // Adjust according to your role structure
  }

  /**
   * 
   * @returns true if the user is indeed authenticated
   */

  isAuthenticated(): boolean {
    return !!this.currentUser; // Returns true if the user is logged in
  }

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
    if (!refreshToken) {
      return throwError(() => new Error("No refresh token available"));
    }
  
    return this.http.post<{ access_token: string }>(this.refreshUrl, this.getAuthHeader(refreshToken)).pipe(
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


  /**
   * 
   * @param form the user form to send to the server
   * @returns An observable containing the server response
   */
  logInUser(form: any) {
    return this.http.post<{ access_token: string; refresh_token: string; user: User }>(this.apiUrlLogin, form);
  }

  /**
   * Logs out the user and reload the app
   */

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next({id: ""});
    this.currentUser = {id: ""};


    window.location.reload()
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


getMinutesRemainingBeforeJwtExpiration(token: string): number | null {
    try {
      const payloadBase64Url = token.split('.')[1];
      if (!payloadBase64Url) {
        return null;
      }
  
      const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - (payloadBase64.length % 4)) % 4);
      const payloadJson = atob(payloadBase64 + padding);
      const payload = JSON.parse(payloadJson);
  
      if (payload && typeof payload.exp === 'number') {
        const expirationTime = new Date(payload.exp * 1000);
        const now = new Date();
        const difference = expirationTime.getTime() - now.getTime();
  
        if (difference <= 0) {
          return 0; // Le jeton a expiré
        }
  
        return Math.floor(difference / (1000 * 60)); // Retourne le temps restant en minutes
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erreur lors du décodage du JWT :', error);
      return null;
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
