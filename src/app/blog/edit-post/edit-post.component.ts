import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Post } from '../models';
import { BlogService } from '../blog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CkeditorComponent } from '../../ckeditor/ckeditor.component';
import { HeaderComponent } from '../../common/header/header.component';
import { ImageUploadComponent } from "../../common/image-uploader.component";

@Component({
  selector: 'app-edit-post',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CkeditorComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    HeaderComponent,
    ImageUploadComponent
],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.scss'
})
export class EditPostComponent implements OnInit {

  authService = inject(AuthService)
  blogService = inject(BlogService)
  postId!: number // Changed type to number
  post: Post | undefined = undefined
  router = inject(Router)
  readonly dialog = inject(MatDialog)
  errorInEditing = signal(false)
  edited = signal(false)
  cd = inject(ChangeDetectorRef)
  editPostForm: FormGroup // Removed <any> for better type inference
  loading = true
  destroyRef = inject(DestroyRef)
  route = inject(ActivatedRoute)
  originalPostSlug: string | null = null; // To store the original slug for update API call
  content = ""

  allTags: string[] = [];
  filteredTags!: Observable<string[]>;
  selectedTags: string[] = [];
  tagCtrl = new FormControl('');

  constructor(private fb: NonNullableFormBuilder) {
    //form initialization
    this.editPostForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['', Validators.required],
      postImg: [],
      date: [''], // Will be populated from post.pub_date (backend's updated_at)
      content: [''],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      alert('Vous devez être connecté pour modifier un article.');
      this.router.navigate(['/auth']);
      return;
    }

    this.loadTags();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.postId = +idParam; // Convert string to number
        this.loadPostData(this.postId);
      } else {
        alert('ID d\'article manquant pour l\'édition.');
        this.router.navigate(['/admin', { outlets: { admin: ['blog', 'posts'] } }]);
      }
    });

    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice())),
    );
  }

  loadTags(): void {
    this.blogService.getTags().subscribe({
      next: (res) => {
        if (res.message === 200 && res.data) {
          this.allTags = res.data.map(tag => tag.name);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
      }
    });
  }

  loadPostData(postId: number): void {
    this.loading = true;
    this.blogService.getPostById(postId).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        console.error('Erreur lors de la récupération de l\'article par ID:', err);
        alert('Erreur lors du chargement de l\'article pour modification.');
        this.router.navigate(['/admin', { outlets: { admin: ['blog', 'posts'] } }]);
        return of(null); // Return an observable of null to prevent further processing
      })
    ).subscribe((res) => {
      if (res && res.data) {
        const post = res.data;
        this.post = post; // Store the fetched post
        this.originalPostSlug = post.slug; // Store the slug for update operation

        this.editPostForm.patchValue({
          title: post.title,
          slug: post.slug,
          description: post.description,
          date: post.pub_date, // Use pub_date (which is updated_at from backend)
          content: post.content,
          postImg: post.postImg
        });
        this.content = post.content
        this.selectedTags = post.tags || []; // Populate selected tags
      } else {
        // Handle case where post data is not found or response is not as expected
        alert('Article non trouvé ou données invalides.');
        this.router.navigate(['/admin', { outlets: { admin: ['blog', 'posts'] } }]);
      }
      this.loading = false;
    });
  }

  onSubmit(): void {
    // Ensure originalPostSlug is available for the update call
    if (this.editPostForm.valid && this.originalPostSlug) {
      const postData: Partial<Post> = {
        title: this.editPostForm.value.title,
        content: this.editPostForm.value.content,
        description: this.editPostForm.value.description,
        tags: this.selectedTags,
        postImg: this.editPostForm.value.postImg,
        slug: this.originalPostSlug // Ensure the original slug is sent for identification
      };

      this.blogService.updatePost(this.postId, postData).subscribe({
        next: (res) => {
          if (res.message === 200 || res.message === 'Post updated successfully') {
            alert('Article mis à jour avec succès !');
            
          } else {
            console.error('Erreur lors de la mise à jour:', res.message);
            alert('Erreur lors de la mise à jour de l\'article: ' + res.message);
          }
        },
        error: (err) => {
          console.error('Erreur HTTP lors de la mise à jour:', err);
          alert('Erreur lors de la mise à jour de l\'article.');
        }
      });
    } else {
      alert('Formulaire invalide ou slug d\'article manquant.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin', { outlets: { admin: ['blog', 'posts'] } }]);
  }

  addTagFromInput(event: any): void {
    const input = event.input;
    const value = (event.value || '').trim();

    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }

    if (input) {
      input.value = '';
    }
    this.tagCtrl.setValue(null);
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.selectedTags.includes(event.option.viewValue)) {
      this.selectedTags.push(event.option.viewValue);
    }
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter(tag => tag.toLowerCase().includes(filterValue) && !this.selectedTags.includes(tag));
  }
}