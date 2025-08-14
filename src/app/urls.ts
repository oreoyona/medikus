import { environment } from "../environments/environment";

/** base url used by the all app. Used by all the urls in the app */
export const baseUrl = environment.baseUrl; 


//course Service urls
export const addUrl = baseUrl + 'courses/add';
export const apiUrl =  baseUrl + 'courses/';

//user service urls
export const userUrl = baseUrl + 'users';
export const allTheUsersApiUrl = userUrl;
export const editUserUrl = baseUrl + "auth/users/";
export const forgotPasswordUrl = baseUrl + 'forgot_password';


//webinaire service urls

export const webinaireBaseUrl = baseUrl + 'webinaires'


//connexion with Google

export const loginWithGoogleUrl = baseUrl + 'auth/google'


//contact
export const medikusMailAdress = `contact@medikus-impulse.com`
export const contactWithMedikusUrl = `https://mailto:${medikusMailAdress}`


