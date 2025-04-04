import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { HelpersService } from './services/helpers.service';

@Component({
  selector: 'app-image-upload',
  template: `
    <div class="mb-3">
      <label class="form-label">Image par défaut</label>
      <div class="input-group">
        <input type="file" class="form-control" (change)="onImageChange($event)" accept="image/*" />
        <div *ngIf="uploading" class="input-group-append">
          <mat-spinner diameter="30"></mat-spinner>
        </div>
      </div>
      <div *ngIf="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>
    </div>
  `,
  styles: [`
    .input-group-append {
      display: flex;
      align-items: center;
      padding: 0 10px;
    }
    .form-control {
      border-radius: 4px;
    }
  `],
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule],
})
export class ImageUploadComponent {
  @Input() imgUrlControl!: AbstractControl<string |
    null, string | null> | null;
  uploading = false;
  errorMessage: string | null = null;

  constructor(private hs: HelpersService) { }

  onImageChange(event: any) {
    const file = event.target.files[0];
    this.errorMessage = null;
    if (file) {
      this.uploading = true;
      this.hs.uploadImgeToBackend(file)
        .pipe(
          catchError((error) => {
            console.error('Image upload error:', error);
            this.errorMessage = "Une erreur est survenue lors du téléchargement de l'image.";
            this.uploading = false;
            return of(null);
          })
        )
        .subscribe((res) => {
          this.uploading = false;
          if (res && res.url) {
            if(this.imgUrlControl){this.imgUrlControl.setValue(res.url);}
          }
        });
    }
  }
}