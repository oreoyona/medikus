import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ImageLibraryComponent } from './image-library.component';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    ImageLibraryComponent
  ],
  template: `
    <h2 mat-dialog-title>Sélectionner une image</h2>
    <mat-dialog-content>
      <mat-tab-group animationDuration="0ms">
        <mat-tab label="Médiathèque">
          <ng-template matTabContent>
            <app-image-library (imageSelected)="onImageSelected($event)"></app-image-library>
          </ng-template>
        </mat-tab>
        <mat-tab label="Télécharger un fichier">
          <ng-template matTabContent>
            <div class="upload-area p-4 text-center">
              <p>Glissez et déposez un fichier ici ou</p>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" class="d-none" #fileInput>
              <button mat-raised-button color="primary" (click)="fileInput.click()">
                <mat-icon>add_a_photo</mat-icon>
                Sélectionner un fichier
              </button>
            </div>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Annuler</button>
      <!-- Le bouton de sélection sera géré dans la librairie -->
    </mat-dialog-actions>
  `,
  styles: [`
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      margin-top: 1rem;
    }
  `]
})
export class ImageDialogComponent {

  private dialogRef = inject(MatDialogRef<ImageDialogComponent>);

  onImageSelected(url: string): void {
    // Ferme le dialogue et renvoie l'URL sélectionnée
    this.dialogRef.close(url);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Logique pour télécharger le fichier et obtenir son URL
      // Pour l'instant, on utilise un aperçu local
      const reader = new FileReader();
      reader.onload = () => {
        // En conditions réelles, vous téléchargez le fichier vers R2 ici
        // et fermez le dialogue avec l'URL retournée par le serveur
        this.dialogRef.close(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
}
