import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

export const maintenanceModeGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const isMaintenance = route.data['maintenanceStatus']; // Read resolved data

  const whitelistedRoutes = [
    '/maintenance', // Add maintenance route to whitelist to prevent infinite loops
    '/auth/login',
    '/auth/inscription',
    '/auth/user/reset',
    '/auth/verify',
    '/auth/registration-success',
    '/auth/activation',
    '/auth/reset-password',
    '/privacy',
    '/terms'
  ];

  // Extract base path without query params for comparison
  const currentRoute = state.url.split('?')[0];

  // If we're already on the maintenance page and not in maintenance mode, redirect home
  if (currentRoute === '/maintenance' && !isMaintenance) {
    return of(router.createUrlTree(['/'])); // Wrap UrlTree with of()
  }

  // If in maintenance mode and current route isn't whitelisted
  if (isMaintenance && !whitelistedRoutes.some(r => currentRoute.startsWith(r))) {
    // Use UrlTree for smoother redirects that work with router animations
    return of(router.createUrlTree(['/maintenance'], { // Wrap UrlTree with of()
      queryParams: { returnUrl: state.url }
    }));
  }

  // Allow navigation in all other cases
  return of(true);
};