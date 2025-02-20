import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';


const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root',
  
})
export class CatalogueService {

  getTheUsers(){
    return this.http.get("http://127.0.0.1:5000/api/v1/users")
  }

  search(searchTerm: string){
    const body = {term: searchTerm}
    return this.http.post("http://127.0.0.1:5000/api/v1/courses/search", body, {headers})
  }

  constructor(private http: HttpClient) { }
}
