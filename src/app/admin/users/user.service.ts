import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../common/infercaces';
import { Router } from '@angular/router';
import { allTheUsersApiUrl, apiUrl, baseUrl, editUserUrl, forgotPasswordUrl, userUrl } from '../../urls';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';


export interface UserData {
  name: string,
  username: string,
  email: string,
  imgUrl: string,
  img?: any
}

export interface userResponse {
  code: number,
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {


  http = inject(HttpClient)
  as = inject(AuthService)
  router = inject(Router)
  authHeader = {
    Authorization: `Bearer ${this.as.currentAcessTokenSubject.value}`
  }
  constructor() { }


  /**
 * 
 * @returns an array of users if the user making the resquest has the required authorization
 */
  getAllUsers() {
    return this.http.get<any[]>(allTheUsersApiUrl).pipe(

    )
  }


  /**
   * resets a password
   */
  resetPassword(email: string) {
    return this.http.post(forgotPasswordUrl, { 'email': email })
  }

  /**
   * sets a new password for the current user.
   * @important The verification is being made through the reset token. 
   * The verification will fail if the token has already expired
   * @param token
   * @param password
   */
  setPassword(token: string, password:string){
    return this.http.post(`${baseUrl}reset_password`, {'token': token, 'password': password})
  }

  /**
   * Checks the username availability is the database
   * @param username 
   * @returns 
   */
  isuserNameAvailable(username: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${baseUrl}username`, { 'username': username })
  }

  /** Verifies the user */
  verifyEmail(token: string) {
    return this.http.get(`${baseUrl}/auth/verify/${token}`)
  }
 /** Verifies the validity of a reset password token */
  verifyPasswordToken(token: string){
    return this.http.get(`${baseUrl}auth/verify/password/${token}`)
  }

  resendVerificationEmail(email: string) {
    const mail = this.as.currentUserSubject.value?.email
    return this.http.post(`${baseUrl}auth/verify`, {'email': email})
  }



  /**
     * get a user from the api by its id
     * @param id: the id of the user
     * @returns a user object
      */
  getUserById(id: number) {
    return this.http.get(`${userUrl}/${id}`, { headers: this.authHeader }).pipe(
      catchError((err) => {
        if (err.status == 404) {
          this.router.navigate(['admin', { outlets: { admin: ['users'] } }])
        }


        ; return of(err)
      })
    )
  }

  /**
     * Retrieves a list of active users, optionally filtered by a time limit.
     *
     * This method makes an HTTP GET request to the backend API to fetch active users.
     * The `limiter` parameter, if provided, specifies a time limit (e.g., number of days) within which
     * users should have been active. If `limiter` is not provided, it retrieves all active users.
     *
     * @param {number} [limiter] - The optional time limit (e.g., number of days) to filter active users.
     * @returns {Observable<any>} An Observable that emits the HTTP response containing the active users data.
     *
     * @example
     * // Retrieve all active users:
     * this.userService.getActiveUsers().subscribe(
     * (response) => {
     * console.log('Active users:', response);
     * },
     * (error) => {
     * console.error('Error retrieving active users:', error);
     * }
     * );
     *
     * @example
     * // Retrieve active users within the last 7 days:
     * this.userService.getActiveUsers(7).subscribe(
     * (response) => {
     * console.log('Active users (last 7 days):', response);
     * },
     * (error) => {
     * console.error('Error retrieving active users (last 7 days):', error);
     * }
     * );
     */
  getActiveUsers(limiter?: number): Observable<any> {
    const url = limiter !== undefined ? `${userUrl}/active/${limiter}` : `${userUrl}/active`;
    return this.http.get(url);
  }

  /**
   * Retrieves a list of newly registered users, optionally filtered by a time limit.
   *
   * This method makes an HTTP GET request to the backend API to fetch new users.
   * The `limiter` parameter, if provided, specifies a time limit (e.g., number of days) within which
   * users should have registered. If `limiter` is not provided, it retrieves all new users.
   *
   * @param {number} [limiter] - The optional time limit (e.g., number of days) to filter new users.
   * @returns {Observable<any>} An Observable that emits the HTTP response containing the new users data.
   *
   * @example
   * // Retrieve all new users:
   * this.userService.getNewUsers().subscribe(
   * (response) => {
   * console.log('New users:', response);
   * },
   * (error) => {
   * console.error('Error retrieving new users:', error);
   * }
   * );
   *
   * @example
   * // Retrieve new users registered within the last 30 days:
   * this.userService.getNewUsers(30).subscribe(
   * (response) => {
   * console.log('New users (last 30 days):', response);
   * },
   * (error) => {
   * console.error('Error retrieving new users (last 30 days):', error);
   * }
   * );
   */
  getNewUsers(limiter?: number): Observable<any> {
    const url = limiter !== undefined ? `${userUrl}/new/${limiter}` : `${userUrl}/new`;
    return this.http.get(url);
  }

  /**
   * make a put request to update the user info
   * @param id the user id
   * @param user the object containg the user new information
   * @returns an observable containing the server response
   */
  editUser(id: number, user: any, authService: AuthService) {

    return this.http.put(`${userUrl}/${id}`, user, { headers: this.authHeader }).pipe(
      tap((res: any) => {
        if (res && res.data) {
          // Update currentUserSubject in AuthService
          authService.currentUserSubject.next(res.data as User);

        }
      })
    )
  }


  editAdminUser(id: number, userData: any) {
    return this.http.put<userResponse | any>(`${editUserUrl + id}`, userData)
  }

  deleteAdminUser(id: number) {
    return this.http.delete(`${editUserUrl + id}`)
  }


  /**
* Formatte un message d'erreur convivial pour l'utilisateur en fonction du code d'erreur HTTP reçu.
*
* Cette fonction prend un code d'erreur HTTP en entrée et renvoie une chaîne de caractères contenant un message
* d'erreur approprié, adapté à l'utilisateur final. Elle gère les codes d'erreur les plus courants et
* fournit un message générique pour les codes non reconnus.
*
* @param httpCode Le code d'erreur HTTP à traiter.
* @returns Une chaîne de caractères contenant le message d'erreur formaté.
*
* @example
* // Exemple d'utilisation :
* const errorMessage = printElegantMessageErrors(404);
* console.log(errorMessage); // Output: Ressource non trouvée.
*
* const networkErrorMessage = printElegantMessageErrors(0);
* console.log(networkErrorMessage); //Output : Veuillez vérifier votre connexion Internet.
*
* @remarks
* Les codes d'erreur HTTP gérés sont les suivants :
* - 0 : Erreur de connexion Internet.
* - 400 : Requête incorrecte.
* - 401 : Non autorisé (authentification requise).
* - 403 : Accès interdit (permissions insuffisantes).
* - 404 : Ressource non trouvée.
* - 405 : Méthode non autorisée.
* - 409 : Conflit (ressource existante).
* - 422 : Entité non traitable (données invalides).
* - 500 : Erreur interne du serveur.
* - 502 : Mauvaise passerelle.
* - 503 : Service indisponible.
* - 504 : Délai d'attente de la passerelle dépassé.
* - default : Erreur inattendue.
*/
  printElegantMessageErrors(httpCode: number): string {
    switch (httpCode) {
      case 0:
        return 'Veuillez vérifier votre connexion Internet.';
      case 400:
        return 'Requête incorrecte. Veuillez vérifier les informations saisies.';
      case 401:
        return 'Non autorisé. Veuillez vous connecter.';
      case 403:
        return 'Accès interdit. Vous n\'avez pas les permissions nécessaires.';
      case 404:
        return 'Ressource non trouvée.';
      case 405:
        return 'Méthode non autorisée.';
      case 409:
        return 'Conflit. La ressource existe déjà.';
      case 422:
        return 'Entité non traitable. Veuillez vérifier les données fournies.';
      case 500:
        return 'Erreur interne du serveur. Veuillez réessayer ultérieurement.';
      case 502:
        return 'Mauvaise passerelle. Veuillez réessayer ultérieurement.';
      case 503:
        return 'Service indisponible. Veuillez réessayer ultérieurement.';
      case 504:
        return 'Délai d\'attente de la passerelle dépassé. Veuillez réessayer ultérieurement.';
      default:
        return 'Une erreur inattendue est survenue. Veuillez réessayer.';
    }
  }





  //VALIDATORS

  usernameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { required: true };
      }

      if (control.value.length < 3) {
        return { minlength: { requiredLength: 3, actualLength: control.value.length } };
      }

      if (!/^\w+$/.test(control.value)) {
        return { pattern: { requiredPattern: '^\\w+$', actualValue: control.value } };
      }
      if (control.value.length > 0 && !/[a-zA-Z0-9]$/.test(control.value)) {
        return { lastChar: true };
      }

      return null; // Return null if the username is valid
    };
  }




  // TEST METHODS

  createLargeDataSet(users: User[], multiplier: number): User[] {
    const largeDataSet: User[] = [];
    for (let i = 0; i < multiplier; i++) {
      largeDataSet.push(...users); // Spread the users array to add its elements
    }
    return largeDataSet;
  }



}
