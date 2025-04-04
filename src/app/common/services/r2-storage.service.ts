import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class R2StorageService {
  private accountId = 'd2912525affd35d0f8db9f057f01cdbc'; // Replace with your Account ID
  private imageDeliveryUrl = `https://pub-88ce7c51bb274fda99b187e90a2daf14.r2.dev/`
  private bucket1Name = 'medikus'; // Replace with your Bucket 1 Name
  private bucket2Name = 'medikus-storage'; // Replace with your Bucket 2 Name
  private apiToken = 'pcsEMFPk35rvg75iDwf-GOMgchP2Z7GRo-jlKGSI'; // Replace with your API Token
  private apiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/r2/buckets`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/octet-stream', // Important for file uploads
    });
  }

  // Upload to a specific bucket
  uploadToBucket(file: File, key: string, bucketName: string): Observable<string> {
    const headers = this.getHeaders();

    return from(file.arrayBuffer()).pipe(
      switchMap((arrayBuffer) => {
        return this.http.put(`${this.apiUrl}/${bucketName}/objects/${key}`, arrayBuffer, { headers, responseType: 'text' });
      }),
      map(() => `https://${bucketName}.YOUR_R2_CUSTOM_DOMAIN/${key}`) // Replace with your R2 custom domain if you have one, or the default url.
    );
  }

  // Get object from a specific bucket
  getObjectFromBucket(key: string, bucketName: string): Observable<Blob> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/${bucketName}/objects/${key}`, { headers, responseType: 'blob' });
  }

  // Delete object from a specific bucket
  deleteObjectFromBucket(key: string, bucketName: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/${bucketName}/objects/${key}`, { headers });
  }

  // List objects in a specific bucket
  listObjectsInBucket(bucketName: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/${bucketName}/objects`, { headers });
  }

  // Generate public url of an object.
  generatePublicUrl(key: string, bucketName: string): string{
    return `https://${bucketName}.YOUR_R2_CUSTOM_DOMAIN/${key}` // Replace with your R2 custom domain if you have one, or the default url.
  }

  // Example usage for your specific buckets
  uploadToBucket1(file: File, key: string): Observable<string> {
    return this.uploadToBucket(file, key, this.bucket1Name);
  }

  uploadToBucket2(file: File, key: string): Observable<string> {
    return this.uploadToBucket(file, key, this.bucket2Name);
  }

  getObjectFromBucket1(key: string): Observable<Blob> {
    return this.getObjectFromBucket(key, this.bucket1Name);
  }

  getObjectFromBucket2(key: string): Observable<Blob> {
    return this.getObjectFromBucket(key, this.bucket2Name);
  }

  deleteObjectFromBucket1(key: string): Observable<any> {
    return this.deleteObjectFromBucket(key, this.bucket1Name);
  }

  deleteObjectFromBucket2(key: string): Observable<any> {
    return this.deleteObjectFromBucket(key, this.bucket2Name);
  }

  listObjectsInBucket1(): Observable<any> {
    return this.listObjectsInBucket(this.bucket1Name);
  }

  listObjectsInBucket2(): Observable<any> {
    return this.listObjectsInBucket(this.bucket2Name);
  }

  getBucket1Url(key: string): string{
    return this.generatePublicUrl(key, this.bucket1Name);
  }

  getBucket2Url(key: string): string{
    return this.generatePublicUrl(key, this.bucket2Name);
  }

}
