// maintenance.resolver.ts
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ConfigService } from './config.service';
import { defer, Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export const maintenanceResolver: ResolveFn<boolean> = (): Observable<boolean> => {
  const configService = inject(ConfigService);

  // Check if the config has already been loaded synchronously
  const config = configService.getConfig();
  if (config !== null) {
    return defer(() => of(config.isMaintenance)); // Use defer to create a delayed Observable
  }

  // If not loaded, use the asynchronous loading mechanism
  return configService.loadConfig().pipe(
    switchMap((loadedConfig) => of(loadedConfig.isMaintenance)),
    catchError(() => of(false)) // In case of an error loading config, default to not in maintenance
  );
};