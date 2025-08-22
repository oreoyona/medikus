import { Component, OnInit, inject, EventEmitter, Output, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
import { baseUrl } from '../urls';

@Component({
  selector: 'app-image-library',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="library-container">
      @if (loadingLibrary()) {
        <div class="status-message">
          <mat-spinner diameter="30"></mat-spinner>
          <p>Chargement des images...</p>
        </div>
      } @else if (libraryImages().length === 0) {
        <div class="status-message">
          <mat-icon>info</mat-icon>
          <p>Aucune image trouvée.</p>
        </div>
      } @else {
        <div class="image-grid">
          @for (url of libraryImages(); track url) {
            <div class="image-item" (click)="selectImage(url)">
              <img [src]="url" alt="Image de la médiathèque">
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .library-container {
      margin-top: 1rem;
      height: 400px; /* Taille fixe pour le dialogue */
      overflow-y: auto;
    }
    .status-message {
      text-align: center;
      padding: 2rem;
    }
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
    }
    .image-item {
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s ease, border-color 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
        border-color: #5c6bc0;
      }

      img {
        width: 100%;
        height: 120px;
        object-fit: cover;
      }

      mat-icon{
        font-size: 1rem;
      }
    }
  `]
})
export class ImageLibraryComponent implements OnInit {
  @Output() imageSelected = new EventEmitter<string>();

  private http = inject(HttpClient);
  private apiUrl = baseUrl + 'get_all_images';

  libraryImages: WritableSignal<string[]> = signal([]);
  loadingLibrary: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this.loadLibraryImages();
  }

  loadLibraryImages(): void {
    this.loadingLibrary.set(true);
    this.http.get<{ urls: string[] }>(this.apiUrl)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.libraryImages.set(response.urls);
          this.loadingLibrary.set(false);
        },
        error: (err) => {
          console.error("Erreur lors du chargement de la librairie d'images", err);
          this.loadingLibrary.set(false);
        }
      });
  }

  selectImage(url: string): void {
    this.imageSelected.emit(url);
  }
}
