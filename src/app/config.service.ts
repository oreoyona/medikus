import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { baseUrl } from './urls';
import { Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


export interface AppConfig {
  isMaintenance: boolean; // Match the key from your backend JSON
  // Add other settings here if your backend provides them
}



@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  destroyRef = inject(DestroyRef)

  private appConfig: AppConfig | null = null;

  constructor(private http: HttpClient) { this.loadConfig().subscribe((res) => {
    this.appConfig = res
  }) }

  loadConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>(`${baseUrl}settings`).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(config => this.appConfig = config)
    );
  }

  getConfig(): AppConfig | null {
   
    return this.appConfig;
  }

  get isMaintenance(): boolean {
  return this.appConfig?.isMaintenance || false; // Default to false if not loaded
  }

  /**
   * Posts a setting in the database
   * @param key 
   * @param value 
   * @returns 
   */
  postSettings(key: string, value: string){
    return this.http.post(`${baseUrl}settings`, {'key': key, 'value': value})
  }

  /**
   * Updates a setting object in the database
   * @param key - used to identify the setting object to modify
   * @param value
   * @returns 
   */

  updateSettings(key: string, value: string){
    return this.http.put(`${baseUrl}settings`, {'key': key, 'value': value})
  }

  /** Returns the basic app mode configurations */
  getSettings(){
    return this.http.get<AppConfig>(`${baseUrl}settings`)
  }


}
