import { Component } from "@angular/core";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";


@Component({
    template: `

    @if(!deleted){
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Voulez-vous vraiment supprimer le cours ?</h5>
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
    imports: [MatDialogModule],
    standalone: true,
})
export class DeleteDialogComponent {
    deleted = false;
    constructor(private dialogRef: MatDialogRef<DeleteDialogComponent>) {}

    confirm() {
        this.deleted = true;
        this.dialogRef.close(true); // Pass true to indicate confirmation
    }

}