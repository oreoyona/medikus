/** base url for the api. Used by all the urls in the app */
export const baseUrl = "http://localhost:5000/api/v1/";

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





