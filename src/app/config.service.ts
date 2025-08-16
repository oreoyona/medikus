import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { baseUrl } from './urls';
import { BehaviorSubject, Observable, takeUntil, tap, of, map } from 'rxjs';
import { Subject } from 'rxjs';

export interface AppConfig {
  /** Whether or not the maintenance mode is on or off */
  isMaintenance: boolean,
  /** Whether or not the ruban should be shown when the CKEditor is activated */
  rubanOnEditor?: boolean,
  /**Whether or not the ruban should be horizontal on the admin panel */
  horizontalRubanOnMobile?: boolean,
  /** Whether or not every one can log in the website */
  authForAll?: boolean,
  /** Whether or not a comment sectiion should be added to blog posts */
  commentsOn?: boolean
  // Add other settings here if your backend provides them
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private appConfig$ = new BehaviorSubject<AppConfig | null>(null); // Initial value is null
  public editorLoaded = signal(false)

  // Expose the config as an Observable
  appConfig: Observable<AppConfig | null> = this.appConfig$.asObservable();

  constructor(private http: HttpClient) {
    this.loadConfig().pipe(takeUntil(this.destroy$)).subscribe((config) => {
      this.appConfig$.next(config);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>(`${baseUrl}settings`).pipe(
      tap(config => this.appConfig$.next(config))
    );
  }

  getConfig(): AppConfig | null {
    return this.appConfig$.value;
  }

  /**
   * Retourne l'état de la configuration de l'application.
   * Si la configuration n'est pas encore chargée, elle retourne des valeurs par défaut.
   */
  getSettings(): Observable<AppConfig> {
    return this.appConfig.pipe(
      takeUntil(this.destroy$),
      map(config => {
        if (!config) {
          // Si la configuration est nulle, chargez-la et fournissez un objet par défaut.
          // Note: La souscription à loadConfig() est gérée par le constructeur.
          return {
            isMaintenance: false,
            rubanOnEditor: false,
            horizontalRubanOnMobile: false,
            authForAll: false,
            commentsOn: false
          };
        }
        // Assurez-vous que toutes les propriétés de AppConfig sont définies.
        return {
          isMaintenance: config.isMaintenance,
          rubanOnEditor: config.rubanOnEditor || false,
          horizontalRubanOnMobile: config.horizontalRubanOnMobile || false,
          authForAll: config.authForAll || false,
          commentsOn: config.commentsOn || false,
        };
      })
    );
  }

  postSettings(key: string, value: string) {
    return this.http.post(`${baseUrl}settings`, { 'key': key, 'value': value });
  }

  updateSettings(key: string, value: string) {
    return this.http.put(`${baseUrl}settings`, { 'key': key, 'value': value });
  }


   get isMaintenance(): boolean {
    // Default to false only if the BehaviorSubject has a non-null value
    return this.appConfig$.value?.isMaintenance || false;
  }
}
