import { Component, EventEmitter, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";


@Component({
    template: `

    @if(!deleted){
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Voulez-vous vraiment supprimer ?</h5>
                <p class="card-text">Cette action est irréversible.</p>
                <button mat-raised-button mat-dialog-close type="button" class="card-link">Annuler</button>
                <button mat-flat-button (click)="confirm()" type="button" class="bg-danger card-link">Confirmer</button>
            </div>
        </div>
    
    }

    @else {

        <div class="card bg-success">
            <div class="card-body">
                <h5 class="card-title">Le cours a été supprimé avec succès</h5>
                <p class="card-text">Quelle est la prochaine étape ?</p>
                <button mat-raised-button mat-dialog-close type="button" routerLink="/courses/add" class="card-link">Ajouter un nouveau cours</button>
                <button mat-flat-button type="button" class="card-link" routerLink="">Acceuil</button>
            </div>
        </div>

    }

    
    `,
    styles: ``,
    imports: [MatDialogModule, MatButtonModule],
    standalone: true,
})
export class DeleteDialogComponent {
    deleted = false;
    @Output() confirmed = new EventEmitter<void>(); // Create the output event

    constructor(private dialogRef: MatDialogRef<DeleteDialogComponent>) {}

    confirm() {
        this.deleted = true;
        this.confirmed.emit(); // Emit the event when confirmed
        this.dialogRef.close(true); // Pass true to indicate confirmation
    }

}