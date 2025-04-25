import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { baseUrl } from './urls';
import { BehaviorSubject, Observable, takeUntil, tap, of, map } from 'rxjs';
import { Subject } from 'rxjs';

export interface AppConfig {
  isMaintenance: boolean;
  // Add other settings here if your backend provides them
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private appConfig$ = new BehaviorSubject<AppConfig | null>(null); // Initial value is null

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

  get isMaintenance(): boolean {
    // Default to false only if the BehaviorSubject has a non-null value
    return this.appConfig$.value?.isMaintenance || false;
  }

  getSettings(): Observable<AppConfig> {
    return this.appConfig.pipe(
      takeUntil(this.destroy$), // Ensure subscription is cleaned up
      tap(config => {
        if (!config) {
          this.loadConfig().subscribe(); // Load config if it hasn't been loaded yet.
        }
      }),
      // Use map to transform the BehaviorSubject's value, or of if it is null
      map(config => config || { isMaintenance: false }) //important: provide default
    );
  }

  postSettings(key: string, value: string) {
    return this.http.post(`${baseUrl}settings`, { 'key': key, 'value': value });
  }

  updateSettings(key: string, value: string) {
    return this.http.put(`${baseUrl}settings`, { 'key': key, 'value': value });
  }
}
