import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Post } from '../models';
import { BlogService } from '../blog.service';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from "../../common/header/header.component";
import { HelpersService } from '../../common/services/helpers.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-all-posts',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    MatDialogModule
  ],
  templateUrl: './all-posts.component.html',
  styleUrl: './all-posts.component.scss'
})
export class AllPostsComponent implements OnInit {

  posts: Post[] = [];
  loading: boolean = true;
  blogService = inject(BlogService)
  authService = inject(AuthService)
  hs = inject(HelpersService)
  currentUser = this.authService.currentUser
  readonly dialog = inject(MatDialog);


  private _snackBar = inject(MatSnackBar)
  openSnackbar(message: string, action: string){
    this._snackBar.open(message, action)

  }


  isAuthenticated() {
    return this.authService.authStatus$
  }

  loadPosts(): void {
    this.loading = true;
    this.blogService.getPosts().subscribe({
      next: (res) => {
        if (res.message === 200 && res.data) {
          // Filtrer uniquement les articles publiés
          this.posts = res.data.filter(post => post.published);
        } else {
          console.error('Erreur lors de la récupération des articles:', res.message);
          this.posts = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur HTTP lors de la récupération des articles:', err);
        this.posts = [];
        this.loading = false;
      }
    });
  }

  confirmDeletion(slug: string) {
    this.blogService.deletePost(slug).subscribe({
      next: (res) => {
        if (res.message === 200 || res.message === 'Post deleted successfully') {
          this.openSnackbar('Article supprimé avec succès !', 'ok');
          this.loadPosts(); // Recharger la liste après suppression
        } else {
          console.error('Erreur lors de la suppression:', res.message);
          this.openSnackbar('Erreur lors de la suppression de l\'article: ' + res.message, 'ok');
        }
      },
      error: (err) => {
        console.error('Erreur HTTP lors de la suppression:', err);
        this.openSnackbar('Erreur lors de la suppression de l\'article.', 'ok');
      }
    });

  }

  openDialog(slug: string) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent)
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeletion(slug)
      }
    })
  }


  deletePost(slug: string): void {

    this.openDialog(slug)

  }


  ngOnInit(): void {
    this.loadPosts()
  }


}
