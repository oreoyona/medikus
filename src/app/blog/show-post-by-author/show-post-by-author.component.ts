import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
import { catchError, of, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

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
    MatButtonModule
  ],
  templateUrl: './show-post-by-author.component.html',
  styleUrl: './show-post-by-author.component.scss'
})
export class ShowPostByAuthorComponent implements OnInit{
  // Component state management using Signals
  loading = signal(true);
  loadingMore = signal(false);
  hasMorePosts = signal(true);
  posts = signal<Post[]>([]);

  // Dependencies
  bs = inject(BlogService);
  destroyRef = inject(DestroyRef);
  authService = inject(AuthService);
  hs = inject(HelpersService);
  router = inject(Router);
  route = inject(ActivatedRoute);

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
    // NOTE: You will need to update your BlogService to accept page and pageSize.
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
        // Append the new posts to the existing posts array.
        this.posts.update(currentPosts => [...currentPosts, ...res.data!]);
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

  /**
   * Placeholder method for deleting a post.
   */
  deletePost(slug: string): void {
    // Your delete logic here
    console.log(`Deleting post with slug: ${slug}`);
  }
}
