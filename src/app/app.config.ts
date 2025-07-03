import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';

/** Default app config for the local database */
const dbConfig: DBConfig = {
  name: 'courseProgressDB',
  version: 1,
  isDefault: false,
  objectStoresMeta: [{
    store: 'userProgress',
    storeConfig: { keyPath: ['userId', 'courseId'], autoIncrement: false }, // Clé composite
    storeSchema: [
      { name: 'completedModules', keypath: 'completedModules', options: { unique: false } },
      { name: 'completedParts', keypath: 'completedParts', options: { unique: false } }
    ]
  }]
};


export const appConfig: ApplicationConfig = {
  
  providers: [
    
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled',anchorScrolling: 'enabled',})), 
    provideAnimationsAsync(), 
    provideHttpClient( withInterceptors([authInterceptor]), withFetch()),
    ...(NgxIndexedDBModule.forRoot(dbConfig).providers || []) // Vérification et valeur par défaut

    
   
  ]
};


