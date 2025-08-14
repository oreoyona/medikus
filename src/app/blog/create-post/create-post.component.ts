import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CkeditorComponent } from '../../ckeditor/ckeditor.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, Observable, startWith, timer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { BlogService } from '../blog.service';
import { Post } from '../models';
import { HelpersService } from '../../common/services/helpers.service';
@Component({
  selector: 'app-create-post',
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
    MatAutocompleteModule
  ],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss'
})
export class CreatePostComponent implements OnInit {

  postForm!: FormGroup;
  isEditMode: boolean = false;
  currentSlug: string | null = null;
  allTags: string[] = []; // Tous les tags disponibles depuis l'API
  filteredTags!: Observable<string[]>;
  selectedTags: string[] = []; // Tags actuellement sélectionnés pour l'article
  tagCtrl = new FormControl('');
  successMsg: WritableSignal<string | null> = signal(null);
  errorMsg: WritableSignal< string | null> = signal(null);

  fb = inject(NonNullableFormBuilder)
  router = inject(Router)
  route = inject(ActivatedRoute)
  authService = inject(AuthService)
  blogService = inject(BlogService)
  hs = inject(HelpersService)


  ngOnInit(): void {

    if (!this.authService.isAuthenticated()) {
      alert('Vous devez être connecté pour créer ou modifier un article.');
      this.router.navigate(['/auth']);
      return;
    }

    this.postForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      content: ['', Validators.required],
      description: '',
      postImg: ''
    });

    this.loadTags();

    this.route.paramMap.subscribe(params => {
      this.currentSlug = params.get('slug');
      if (this.currentSlug) {
        this.isEditMode = true;
        this.loadPostData(this.currentSlug);
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


  loadPostData(slug: string): void {
    this.blogService.getPostBySlug(slug).subscribe({
      next: (res) => {
        if (res.message === 200 && res.data) {
          this.postForm.patchValue({
            title: res.data.title,
            slug: res.data.slug,
            content: res.data.content
          });
          this.selectedTags = res.data.tags || []; // Initialise les tags sélectionnés
        } else {
          alert('Article non trouvé pour modification.');
          this.router.navigate(['/posts']);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données de l\'article:', err);
        alert('Erreur lors du chargement des données de l\'article.');
        this.router.navigate(['/posts']);
      }
    });
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      const postData: Post = {
        ...this.postForm.value,
        tags: this.selectedTags // Ajoute les tags sélectionnés
      };

     
        this.blogService.createPost(postData).subscribe({
          next: (res) => {
            if (res.message === 201 || res.message === 'Post created successfully') {
              this.successMsg.set('Article créé avec succès !');
              this.postForm.reset();
              this.hs.goToTop()
              timer(5000).subscribe(()=>{
                this.successMsg.set(null)
              })
              
            } else {
              console.error('Erreur lors de la création:', res.message);
              this.errorMsg.set('Erreur lors de la création de l\'article: ' + res.message);
            }
          },
          error: (err) => {
            console.error('Erreur HTTP lors de la création:', err);
            alert('Erreur lors de la création de l\'article.');
          }
        });
      }
    }
  

  onCancel(): void {
    this.router.navigate(['/posts']);
  }

  // --- Fonctions de gestion des tags ---
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


