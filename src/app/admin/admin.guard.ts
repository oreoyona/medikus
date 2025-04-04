import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';


export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

  const authService = inject(AuthService)
  const router = inject(Router)

  

  if(authService.isAdmin()){
    return true
  }

  else{
    const route = inject(Router)
    route.navigate(['dashboard'], {queryParams: {returnUrl: state.url}})
    return false
  }
};

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) { 
    return true; // Allow access if authenticated
  } else {
    router.navigate(['/auth/login']); // Redirect to login if not authenticated
    return false; // Deny access
  }
};
