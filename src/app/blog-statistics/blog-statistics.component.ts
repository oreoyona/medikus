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
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeleteConfirmationDialogComponent } from '../blog/delete-confirmation-dialog/delete-confirmation-dialog.component';

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
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './blog-statistics.component.html',
  styleUrls: ['./blog-statistics.component.scss']
})
export class BlogStatisticsComponent implements OnInit {
  private blogService = inject(BlogService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = true;
  message: string | null = null;
  allPosts: any[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['id', 'title', 'views_count', 'status', 'action'];

  pageSizeOptions: number[] = [5, 10, 25, 100];
  selectedStatus: string = 'all';

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
            this.allPosts = response.data.map((post: any) => ({
              id: post.id,
              title: post.title,
              views_count: post.views_count,
              published: post.published,
              draft: post.draft,
              slug: post.slug
            }));
            this.applyFilter();
          } else {
            this.message = 'Aucun article trouvé.';
            this.allPosts = [];
            this.dataSource.data = [];
          }
        },
        error: (err) => {
          this.loading = false;
          this.message = 'Erreur lors du chargement des statistiques des articles.';
          console.error('Error fetching article statistics', err);
        }
      });
  }

  applyFilter(): void {
    let filteredPosts = this.allPosts;
    if (this.selectedStatus === 'published') {
      filteredPosts = this.allPosts.filter(post => post.published);
    } else if (this.selectedStatus === 'draft') {
      filteredPosts = this.allPosts.filter(post => post.draft);
    }
    this.dataSource.data = filteredPosts;
    this.dataSource.paginator = this.paginator;
  }

  goToPostDetail(postId: number): void {
    this.router.navigate(['blog/posts', postId]);
  }

  editPost(slug: string): void {
    this.router.navigate(['/blog/posts/edit', slug]);
  }

  deletePost(slug: string): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '350px',
      data: { slug: slug }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.blogService.deletePost(slug).subscribe({
          next: (res) => {
            if (res.message === 200 || res.message === 'Post deleted successfully') {
              this.showSnackbar('Article supprimé avec succès !', 'Fermer');
              this.loadArticleStats();
            } else {
              console.error('Erreur lors de la suppression:', res.message);
              this.showSnackbar('Erreur lors de la suppression de l\'article.', 'Fermer');
            }
          },
          error: (err) => {
            console.error('Erreur HTTP lors de la suppression:', err);
            this.showSnackbar('Erreur lors de la suppression de l\'article.', 'Fermer');
          }
        });
      }
    });
  }

  private showSnackbar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }
}
