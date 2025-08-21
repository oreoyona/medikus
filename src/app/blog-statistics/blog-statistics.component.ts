import { Component, OnInit, inject, ViewChild, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlogService } from '../blog/blog.service';

// Assuming you have a loading spinner component
// import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-blog-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    // LoadingSpinnerComponent
  ],
  templateUrl: './blog-statistics.component.html',
  styleUrls: ['./blog-statistics.component.scss']
})
export class BlogStatisticsComponent implements OnInit {
  private blogService = inject(BlogService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = true;
  message: string | null = null;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['id', 'title', 'views_count', 'action'];

  pageSizeOptions: number[] = [5, 10, 25, 100];

  ngOnInit(): void {
    this.loadArticleStats();
  }

  loadArticleStats(): void {
    this.loading = true;
    this.blogService.getPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response?.data && response.data.length > 0) {
            this.dataSource.data = response.data.map((post: any) => ({
              id: post.id,
              title: post.title,
              views_count: post.views_count
            }));
            this.dataSource.paginator = this.paginator;
          } else {
            this.message = 'Aucun article trouvé.';
          }
        },
        error: (err) => {
          this.loading = false;
          this.message = 'Erreur lors du chargement des statistiques des articles.';
          console.error('Error fetching article statistics', err);
        }
      });
  }

  goToPostDetail(postId: number): void {
    // Navigate to the post detail page. Adjust the route as needed.
    this.router.navigate(['blog/posts', postId]);
  }
}