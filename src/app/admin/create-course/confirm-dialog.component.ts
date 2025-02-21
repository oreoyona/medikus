import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
    template: `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Voulez-vous vraiment supprimer le module ?</h5>
                <p class="card-text">Cette action est irréversible.</p>
                <button mat-raised-button mat-dialog-close type="button" class="card-link">Annuler</button>
                <button mat-flat-button (click)="confirm()" type="button" class="bg-danger card-link">Confirmer</button>
            </div>
        </div>
    `,
    styles: ``,
    standalone: true,
    imports: [MatButtonModule, MatDialogModule]
})
export class ConfirmDialogComponent {
    constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

    confirm() {
        this.dialogRef.close(true); // Pass true to indicate confirmation
    }
}