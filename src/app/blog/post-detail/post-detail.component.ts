import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Post } from '../models';
import { BlogService } from '../blog.service';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from "../../common/header/header.component";
import { HelpersService } from '../../common/services/helpers.service';
// Import the DomSanitizer to mark the HTML as safe
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormatDatePipe } from "../../common/pipes/format-date.pipe";

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    FormatDatePipe
],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent implements OnInit{

  post: Post | null = null;
  loading: boolean = true;
  commentForm!: FormGroup;
  currentSlug: string = '';
  sanitizedContent: SafeHtml | undefined; // Property to hold the safe HTML

  route = inject(ActivatedRoute)
  router = inject(Router)
  blogService = inject(BlogService)
  authService = inject(AuthService)
  hs = inject(HelpersService)
  fb = inject(FormBuilder)
  private sanitizer = inject(DomSanitizer); // Inject DomSanitizer

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      body: ['', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      this.currentSlug = params.get('slug') || '';
      if (this.currentSlug) {
        this.loadPostDetail(this.currentSlug);
      }
    });
  }

  loadPostDetail(slug: string): void {
    this.loading = true;
    this.blogService.getPostBySlug(slug).subscribe({
      next: (res) => {
        if (res.message === 200 && res.data) {
          this.post = res.data;
          // Process the content to replace custom tags
          if (this.post.content) {
            this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.blogService.processContent(this.post.content));
          }
        } else {
          console.error('Erreur lors de la récupération de l\'article:', res.message);
          this.post = null;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur HTTP lors de la récupération de l\'article:', err);
        this.post = null;
        this.loading = false;
      }
    });
  }

  addComment(): void {
    if (this.commentForm.valid && this.post) {
      this.blogService.addComment(this.currentSlug, this.commentForm.value.body).subscribe({
        next: (res) => {
          if (res.message === 201 || res.message === 'Comment added successfully') {
            alert('Commentaire ajouté avec succès !');
            this.commentForm.reset();
            this.loadPostDetail(this.currentSlug);
          } else {
            console.error('Erreur lors de l\'ajout du commentaire:', res.message);
            alert('Erreur lors de l\'ajout du commentaire: ' + res.message);
          }
        },
        error: (err) => {
          console.error('Erreur HTTP lors de l\'ajout du commentaire:', err);
          alert('Erreur lors de l\'ajout du commentaire.');
        }
      });
    }
  }

  deletePost(slug: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      this.blogService.deletePost(slug).subscribe({
        next: (res) => {
          if (res.message === 200 || res.message === 'Post deleted successfully') {
            alert('Article supprimé avec succès !');
            this.router.navigate(['/posts']);
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

}