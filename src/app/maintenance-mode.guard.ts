import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ConfigService } from './config.service';

export const maintenanceModeGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const configService = inject(ConfigService);
  const router = inject(Router);

  return configService.appConfig.pipe(
    map((config) => {
      const isMaintenance = config?.isMaintenance || false;

      const whitelistedRoutes = [
        '/maintenance',
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

      const currentRoute = state.url.split('?')[0];

      if (currentRoute === '/maintenance' && !isMaintenance) {
        return router.createUrlTree(['/']);
      }

      if (isMaintenance && !whitelistedRoutes.some(r => currentRoute.startsWith(r))) {
        return router.createUrlTree(['/maintenance'], {
          queryParams: { returnUrl: state.url }
        });
      }

      return true;
    })
  );
};
