import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { HeaderComponent } from "../../common/header/header.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { DatePipe, LowerCasePipe } from '@angular/common';
import { HelpersService } from '../../common/services/helpers.service';
import { AuthService } from '../../auth/auth.service';
import { Post } from '../models';
import { BlogService } from '../blog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of, single, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-show-post-by-author',
  standalone: true,
  imports: [
    HeaderComponent,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './show-post-by-author.component.html',
  styleUrl: './show-post-by-author.component.scss'
})
export class ShowPostByAuthorComponent implements OnInit {
  // Component state management using Signals
  loading = signal(true);
  loadingMore = signal(false);
  hasMorePosts = signal(true);
  posts = signal<Post[]>([]);


  //properties to handle delete posts states

  deletePostLoader = false;
  deletePostSuccessMsg: WritableSignal<string | null> = signal(null)
  deletePostErrorMsg: WritableSignal<string | null> = signal(null)

  // Dependencies
  bs = inject(BlogService);
  destroyRef = inject(DestroyRef);
  authService = inject(AuthService);
  hs = inject(HelpersService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  blogService = inject(BlogService)
  private _snackBar = inject(MatSnackBar)

  // Component properties
  username = "unknow";
  invalidUserName = signal(false);
  private currentPage = 1;
  private readonly pageSize = 10;

  ngOnInit(): void {
    // We first get the username from the URL parameter.
    this.route.paramMap.pipe(
      switchMap(param => {
        this.username = param.get('name') || "unknow";
        if (this.username === "unknow") {
          this.invalidUserName.set(true);
          return of({ data: [] as Post[] });
        }
        // Then, we call the method to load the initial set of posts.
        // The subscription and loading logic are now handled within loadPosts.
        this.loadPosts();
        return of({}); // Return a placeholder observable to continue the stream
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  /**
   * Loads a new page of posts from the API.
   * Updates loading states and appends new posts to the existing list.
   */
  loadPosts(): void {
    // Set the appropriate loading indicator based on whether it's the initial load or a subsequent one.
    if (this.currentPage === 1) {
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    // Call the BlogService with pagination parameters.
    this.bs.getUserPosts(this.username, this.currentPage, this.pageSize).pipe(
      catchError((err) => {
        console.error('Failed to fetch posts:', err);
        this.hasMorePosts.set(false);
        // You might also want to display an error message to the user here.
        return of({ data: [] as Post[] });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      if (res.data) {
        let filteredPosts = res.data.filter(post =>{
          return post.published == true || post.published == null
        })
        // Append the new posts to the existing posts array.
        this.posts.update(currentPosts => [...currentPosts, ...filteredPosts]);
        // Determine if there are more pages to load.
        this.hasMorePosts.set(res.data.length === this.pageSize);
      }
      // Reset all loading indicators.
      this.loading.set(false);
      this.loadingMore.set(false);
    });
  }

  /**
   * Triggers the loading of the next page of posts.
   * This method is called by the "Load More" button in the template.
   */
  loadMorePosts(): void {
    this.currentPage++;
    this.loadPosts();
  }

  openSnackBar(message: string, action: string) {
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
          this.deletePostSuccessMsg.set("L'article a été supprimé avec succès")
          this.openSnackBar("L'article a été supprimé avec succès", "ok")
        }

        else {
          this._snackBar.open("Erreur dans la suppression de l'article", "ok")
        }
      })
  }
}
