import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CkeditorComponent } from '../../ckeditor/ckeditor.component';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, Observable, startWith, timer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { BlogService } from '../blog.service';
import { Post } from '../models';
import { HelpersService } from '../../common/services/helpers.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageUploadComponent } from "../../common/image-uploader.component";


@Component({
  selector: 'app-create-post',
  standalone: true,
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
    MatCheckboxModule,
    MatProgressSpinnerModule,
    ImageUploadComponent
  ],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss'
})
export class CreatePostComponent implements OnInit {

  postForm!: FormGroup;
  allTags: string[] = [];
  filteredTags!: Observable<string[]>;
  selectedTags: string[] = [];
  tagCtrl = new FormControl('');
  successMsg: WritableSignal<string | null> = signal(null);
  errorMsg: WritableSignal<string | null> = signal(null);

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  fb = inject(NonNullableFormBuilder);
  router = inject(Router);
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  blogService = inject(BlogService);
  hs = inject(HelpersService);
  loader: boolean = false


  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      console.warn('Vous devez être connecté pour créer un article.');
      this.router.navigate(['/auth']);
      return;
    }
    this.initForm();
    this.loadTags();
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice())),
    );

    // Écoute les changements du titre pour générer le slug automatiquement
    this.postForm.get('title')?.valueChanges.subscribe(title => {
      this.postForm.get('slug')?.setValue(this.generateSlug(title));
    });
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      content: ['', Validators.required],
      description: [''],
      postImg: [''],
      is_published: [false]
    });
  }

  // Fonction pour générer le slug, avec une longueur maximale pour le SEO
  generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/[^\w-]+/g, '') // Supprime les caractères non alphanumériques et non-tirets
      .replace(/--+/g, '-'); // Remplace les doubles tirets par un seul
    
    // Limite le slug à 60 caractères pour des raisons de SEO
    return slug.substring(0, 60);
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

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      this.errorMsg.set('Veuillez remplir tous les champs requis.');
      return;
    }
    this.loader = true;

    const postData: Post = {
      ...this.postForm.value,
      tags: this.selectedTags,
      is_published: this.postForm.value.is_published,
    };

    console.log('Payload de la requête:', postData);

    this.blogService.createPost(postData).subscribe({
      next: (res) => {
        if (res.message === 201 || res.message === 'Post created successfully') {
          this.loader = false;
          this.successMsg.set('Article créé avec succès !');
          this.postForm.reset();
          this.selectedTags = [];
          this.hs.goToTop();
          timer(5000).subscribe(() => {
            this.successMsg.set(null);
          });
        } else {
          this.loader = false
          console.error('Erreur lors de la création:', res.message);
          this.errorMsg.set('Erreur lors de la création de l\'article: ' + res.message);
        }
      },
      error: (err) => {
        this.loader = true
        console.error('Erreur HTTP lors de la création:', err);
        this.errorMsg.set('Erreur lors de la création de l\'article.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin']);
  }

  addTagFromInput(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    event.chipInput!.clear();
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
