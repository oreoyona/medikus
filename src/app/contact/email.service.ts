import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from '../urls';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = baseUrl + 'join' // L'URL de votre endpoint backend pour l'envoi d'e-mails

  constructor(private http: HttpClient) { }

  sendEmail(to: string, subject: string, body: string): Observable<any> {
    return this.http.post(this.apiUrl, { to, subject, body });
  }
}