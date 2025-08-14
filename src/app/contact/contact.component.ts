import { Component, inject } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'
import { HeaderComponent } from "../common/header/header.component";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmailService } from './email.service';
import { medikusMailAdress } from '../urls';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-contact',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  pageTitle = "Contacter Medikus Impulse"
  private emailService = inject(EmailService)
  private snackBar: MatSnackBar = new MatSnackBar();
  loading = false
  sent = false
  error = false

  form = new FormGroup({
    name: new FormControl("", Validators.required),
    email: new FormControl(""),
    tel: new FormControl("", [Validators.required])
  });
  websiteContactEmail = medikusMailAdress

  onSubmit() {
    this.loading = true
    if (this.form.valid) {
      const subject = "Demande de contact - Rejoindre Medikus";
      const body = `
        name: ${this.form.get('name')?.value}
        email: ${this.form.get('email')?.value}
        tel: ${this.form.get('tel')?.value}
      `;

      this.emailService.sendEmail(this.websiteContactEmail, subject, body)
        .subscribe({
          next: (response) => {
            this.sent = true
            this.loading = false

            this.form.reset(); // Réinitialiser le formulaire après l'envoi
          },
          error: (error) => {
            this.sent = true
            this.error = true
            this.loading = false

            console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
            this.snackBar.open('Une erreur s\'est produite lors de l\'envoi du message. Veuillez réessayer plus tard.', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar'] 
            });
          }
        });
    } else {
      // Marquer tous les contrôles comme touchés pour afficher les erreurs de validation
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      this.snackBar.open('Veuillez remplir tous les champs correctement.', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar'] // Vous pouvez définir des classes CSS pour styliser la notification d'avertissement
      });
    }
  }
}
