import { Component, OnInit, HostListener, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../blog.service';
import { EMPTY, of } from 'rxjs';
import { catchError} from 'rxjs/operators';
import { Post, Tag } from '../models';
import { HeaderComponent } from "../../common/header/header.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";
import { HelpersService } from '../../common/services/helpers.service';
import { AuthService } from '../../auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';




// Define the component and its metadata
@Component({
  selector: 'app-show-post-by-tag',
  imports: [
    CommonModule, 
    HeaderComponent, 
    MatProgressSpinnerModule, 
    MatCardModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    


  ],
  templateUrl: './show-post-by-tag.component.html',
  styleUrl: './show-post-by-tag.component.scss'
})
export class ShowPostByTagComponent implements OnInit {

  tagName: string | null = null;
  currentPage = 1;
  isLoading = false;
  hasMorePosts = signal(true);
  error: string | null = null;


  //loaders
  deletePostLoader = false;


  loading = signal(true);
  loadingMore = signal(false);
  posts = signal<Post[]>([]);
  destroyRef = inject(DestroyRef)
  _snackBar = inject(MatSnackBar)

  hs = inject(HelpersService)
  authService  = inject(AuthService)

  // Use a listener to detect when the user scrolls near the bottom of the page
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const scrollPosition = (window.innerHeight + window.scrollY);
    const documentHeight = document.documentElement.scrollHeight;
    
    // Check if the user is 90% of the way to the bottom of the page
    if (scrollPosition >= documentHeight * 0.9 && !this.isLoading && this.hasMorePosts()) {
      this.loadPosts();
    }
  }

  // Inject the required services
  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  // Lifecycle hook to initialize the component
  ngOnInit(): void {
    // Get the tag name from the URL route parameters
    this.route.paramMap.subscribe(params => {
      this.tagName = params.get('tagName');
      

      
      this.posts.set([]);
      this.currentPage = 1;
      this.hasMorePosts.set(true);
      this.loading.set(false);
      // this.isLoading = false;
      this.error = null;
      if (this.tagName) {
        this.loadPosts();
      }
    });
  }

  convertToTag(el: any): Tag{
    return el as Tag
  }

  // Method to fetch posts from the API
  loadPosts(): void {
    if (this.isLoading || !this.hasMorePosts || !this.tagName) {
      return;
    }

    this.isLoading = true;
    
    // Call the service to get posts for the current page
    this.blogService.getPostsByTag(this.tagName, this.currentPage)
      .pipe(
        // Handle any errors that might occur during the API call
        catchError(err => {
          this.isLoading = false;
          this.error = 'Failed to load posts. Please try again.';
          console.error('Error fetching posts:', err);
          return EMPTY; // Return an empty observable to prevent the stream from completing
        })
      )
      .subscribe(response => {
        this.isLoading = false;
        if (response) {
          // Append the new posts to the existing array
          this.posts.set([...this.posts(), ...response.posts]);
          
          // Check if there are more posts to load based on the pagination data
          this.hasMorePosts.set(response.pagination.has_next);
          if (this.hasMorePosts()) {
            this.currentPage++;
          }
        }
      });
  }

  private openSnackBar(message: string, action: string){
    this._snackBar.open(message, action)
  }

  deletePost(slug: string): void {
    this.deletePostLoader = true
    this.blogService.deletePost(slug).pipe(takeUntilDestroyed(this.destroyRef),
      catchError((err) => {

        this._snackBar.open("une erreur inconnue est survenue", "ok")
        console.log(err)
        return of(err)
      }))
      .subscribe((res) => {
        if (res.data) {
          this.deletePostLoader = false
          this.openSnackBar("L'article a été supprimé avec succès", "ok")
        }

        else {
          this._snackBar.open("Erreur dans la suppression de l'article", "ok")
        }
      })
  }
}
