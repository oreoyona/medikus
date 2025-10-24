import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from './image-dialog.component';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss'
})
export class ImageUploadComponent implements OnInit {

  @Input() imgUrlControl!: AbstractControl;

  private dialog = inject(MatDialog);

  constructor() { }

  ngOnInit(): void {
    // Aucune logique spécifique nécessaire ici pour le moment
  }

  /**
   * Ouvre le dialogue de sélection d'image.
   */
  openImageDialog(): void {
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: '800px',
      height: '600px',
      data: { selectedImageUrl: this.imgUrlControl.value }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Met à jour le FormControl avec l'URL de l'image sélectionnée
        this.imgUrlControl.setValue(result);
      }
    });
  }
}
