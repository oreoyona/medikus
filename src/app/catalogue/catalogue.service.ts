import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
  
})
export class CatalogueService {

  getTheUsers(){
    return this.http.get("http://127.0.0.1:5000/api/v1/users")
  }

  constructor(private http: HttpClient) { }
}
