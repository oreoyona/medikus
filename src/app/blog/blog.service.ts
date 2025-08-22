import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { baseUrl } from '../urls';
import { ApiResponse, Post, Tag } from './models';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class BlogService {

    http = inject(HttpClient)
    authService = inject(AuthService)
    private apiUrl = baseUrl;


    getPosts(): Observable<ApiResponse<Post[]>> {
        
       
        return this.http.get<ApiResponse<Post[]>>(`${this.apiUrl}posts/`);
    }

    getPostBySlug(slug: string): Observable<ApiResponse<Post>> {
        return this.http.get<ApiResponse<Post>>(`${this.apiUrl}posts/${slug}`);
    }

    getPostById(id: number): Observable<ApiResponse<Post>> {
        return this.http.get<ApiResponse<Post>>(`${this.apiUrl}posts/${id}`);
    }

    createPost(post: Post): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}posts/add`, post);
    }

    updatePost(id: number, post: Partial<Post>): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}posts/edit/${id}`, post);
    }

    deletePost(slug: string): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}posts/${slug}`);
    }

    addComment(slug: string, commentBody: string): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}posts/${slug}/comments`, { body: commentBody });
    }

    // --- Méthodes pour les tags ---
    getTags(): Observable<ApiResponse<Tag[]>> {
        return this.http.get<ApiResponse<Tag[]>>(`${this.apiUrl}tags/`);
    }

    // --- Méthodes pour les utilisateurs ---
    /**
   * Fetches a paginated list of posts for a specific user.
   * @param username The username of the author.
   * @param page The page number to fetch (1-indexed).
   * @param pageSize The number of posts per page.
   * @returns An Observable of the API response containing the posts and pagination info.
   */
    getUserPosts(username: string, page: number, pageSize: number): Observable<ApiResponse<Post[]>> {
        // Construct the query parameters using HttpParams for clean URL building
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<ApiResponse<Post[]>>(`${this.apiUrl}users/${username}/posts`, { params });
    }



    processContent(content: string): string {
        let processedContent = content;

        // Regex to find (image:url) and replace with <img class="content-image" src="url">
        const imageRegex = /\(image:(\s*http[^)]+)\)/g;
        processedContent = processedContent.replace(imageRegex, `<img class="content-image" src="$1" alt="Article image">`);

        // Regex to find (video:url) and replace with <iframe class="content-video" src="url"></iframe>
        const videoRegex = /\(video:(\s*http[^)]+)\)/g;
        processedContent = processedContent.replace(videoRegex, `<iframe class="content-video" src="$1" frameborder="0" allowfullscreen></iframe>`);

        return processedContent;
    }


     generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/[^\w-]+/g, '') // Supprime les caractères non alphanumériques et non-tirets
      .replace(/--+/g, '-'); // Remplace les doubles tirets par un seul
  }

}