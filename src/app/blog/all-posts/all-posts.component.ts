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
],
  templateUrl: './all-posts.component.html',
  styleUrl: './all-posts.component.scss'
})
export class AllPostsComponent implements OnInit{

  posts: Post[] = [];
  loading: boolean = true;
  blogService = inject(BlogService)
  authService = inject(AuthService)
  hs = inject(HelpersService)
  currentUser = this.authService.currentUser
  


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

  deletePost(slug: string): void {
    // Remplacer `confirm` par une modale personnalisée pour une meilleure expérience utilisateur
    // et éviter les alertes de navigateur.
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      this.blogService.deletePost(slug).subscribe({
        next: (res) => {
          if (res.message === 200 || res.message === 'Post deleted successfully') {
            alert('Article supprimé avec succès !');
            this.loadPosts(); // Recharger la liste après suppression
          } else {
            console.error('Erreur lors de la suppression:', res.message);
            alert('Erreur lors de la suppression de l\'article: ' + res.message);
          }
        },
        error: (err) => {
          console.error('Erreur HTTP lors de la suppression:', err);
          alert('Erreur lors de la suppression de l\'article.');
        }
      });
    }
  }


  ngOnInit(): void {
      this.loadPosts()
  }


}
