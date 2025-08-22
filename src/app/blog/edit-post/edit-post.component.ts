import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Post } from '../models';
import { BlogService } from '../blog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, startWith, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HeaderComponent } from '../../common/header/header.component';
import { ImageUploadComponent } from "../../common/image-uploader.component";
import { CkeditorComponent } from '../../ckeditor/ckeditor.component';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { HelpersService } from '../../common/services/helpers.service';

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
    ImageUploadComponent,
    CkeditorComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.scss'
})
export class EditPostComponent implements OnInit {

  authService = inject(AuthService)
  blogService = inject(BlogService)
  postId!: number
  post: Post | undefined = undefined
  router = inject(Router)
  readonly dialog = inject(MatDialog)
  errorInEditing = signal(false)
  edited = signal(false)
  cd = inject(ChangeDetectorRef)
  editPostForm: FormGroup
  loading = true
  destroyRef = inject(DestroyRef)
  route = inject(ActivatedRoute)
  hs = inject(HelpersService)
  originalPostSlug: string | null = null;
  content = ""
  loader = false;
  articleLoading = true

  allTags: string[] = [];
  filteredTags!: Observable<string[]>;
  selectedTags: string[] = [];
  tagCtrl = new FormControl('');
  unpublishLoader = false
  publishLoader = false
  errorMsg: WritableSignal<string | null> = signal(null);
  successMsg: WritableSignal<string | null> = signal(null)
  postNotFoundError: WritableSignal<string | null> = signal(null);

  constructor(private fb: NonNullableFormBuilder) {
    this.editPostForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['', Validators.required],
      postImg: [],
      date: [''],
      content: [''],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAdmin() && !this.authService.isEditor()) {
      this.postNotFoundError.set("Vous n'avez pas les droits nécessaires pour modifier cet article");
      return;
    }

    this.loadTags();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.postId = +idParam;
        this.loadPostData(this.postId);
      } else {
        this.postNotFoundError.set('ID d\'article manquant pour l\'édition.')
        this.articleLoading = false
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
    this.articleLoading = true;
    this.blogService.getPostById(postId).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        console.error('Erreur lors de la récupération de l\'article par ID:', err);
        this.postNotFoundError.set('Erreur lors du chargement de l\'article pour modification.')
        this.articleLoading = false;
        return of(null);
      })
    ).subscribe((res) => {
      if (res && res.data) {
        const post = res.data;
        this.post = post;
        this.originalPostSlug = post.slug;

        this.editPostForm.patchValue({
          title: post.title,
          slug: post.slug,
          description: post.description,
          date: post.pub_date,
          content: post.content,
          postImg: post.postImg
        });
        this.content = post.content
        this.selectedTags = post.tags || [];
      } else {
        this.postNotFoundError.set('Article non trouvé ou données invalides.');
      }
      this.articleLoading = false;
    });
  }

  onSubmit(): void {
    this.loader = true
    if (this.editPostForm.valid && this.originalPostSlug) {
      const postData: Partial<Post> = {
        title: this.editPostForm.value.title,
        content: this.editPostForm.value.content,
        description: this.editPostForm.value.description,
        tags: this.selectedTags,
        postImg: this.editPostForm.value.postImg,
        slug: this.originalPostSlug
      };

      this.blogService.updatePost(this.postId, postData).subscribe({
        next: (res) => {
          this.loader = false
          if (res.message === 200 || res.message === 'Post updated successfully') {
            this.successMsg.set('Article mis à jour avec succès !');

            timer(5000).subscribe(() => {
              this.successMsg.set(null)
            })
            this.hs.goToTop();
          } else {
            console.error('Erreur lors de la mise à jour:', res.message);
            this.errorMsg.set('Erreur lors de la mise à jour de l\'article: ' + res.message);
          }
        },
        error: (err) => {
          this.loader = false

          console.error('Erreur HTTP lors de la mise à jour:', err);
          this.errorMsg.set('Erreur lors de la mise à jour de l\'article.');
        }
      });
    } else {
      this.errorMsg.set('Formulaire invalide ou slug d\'article manquant.');
    }
  }

  onPublishDraft(): void {
    this.publishLoader = true;
    if (this.editPostForm.valid && this.post) {
      const postData: Partial<Post> = {
        title: this.editPostForm.value.title,
        content: this.editPostForm.value.content,
        description: this.editPostForm.value.description,
        tags: this.selectedTags,
        postImg: this.editPostForm.value.postImg,
        published: true,
        draft: false
      };
      this.blogService.updatePost(this.postId, postData).subscribe({
        next: (res) => {
          this.publishLoader = false;
          if (res.message === 200 || res.message === 'Post updated successfully') {
            this.successMsg.set('Article publié avec succès !');
            this.post!.published = true;
            this.post!.draft = false;

          } else {
            console.error('Erreur lors de la publication:', res.message);
            this.errorMsg.set('Erreur lors de la publication de l\'article: ' + res.message);
          }
        },
        error: (err) => {
          this.publishLoader = false;
          console.error('Erreur HTTP lors de la publication:', err);
          this.errorMsg.set('Erreur lors de la publication de l\'article.');
        }
      });
    } else {
      this.errorMsg.set('Formulaire invalide ou article manquant.');
    }
  }

  unpublishPost(): void {
    this.unpublishLoader = true;
    if (this.post && this.post.published) {
      const postData: Partial<Post> = {
        published: false,
        draft: true
      };
      this.blogService.updatePost(this.postId, postData).subscribe({
        next: (res) => {
          this.unpublishLoader = false;
          if (res.message === 200 || res.message === 'Post updated successfully') {
            this.successMsg.set('Article dépublié avec succès et sauvegardé en brouillon !');
            this.post!.published = false;
            this.post!.draft = true;

          } else {
            console.error('Erreur lors de la dépublication:', res.message);
            this.errorMsg.set('Erreur lors de la dépublication de l\'article: ' + res.message);
          }
        },
        error: (err) => {
          this.unpublishLoader = false;
          console.error('Erreur HTTP lors de la dépublication:', err);
          this.errorMsg.set('Erreur lors de la dépublication de l\'article.');
        }
      });
    } else {
      this.errorMsg.set('L\'article n\'est pas publié.');
    }
  }


  onCancel(): void {
    this.router.navigateByUrl('/admin')
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
