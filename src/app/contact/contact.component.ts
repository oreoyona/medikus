import { Component } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'
import { HeaderComponent } from "../common/header/header.component";
@Component({
  selector: 'app-contact',
  imports: [MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, FormsModule, HeaderComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  pageTitle = "Contacter Medikus Impulse"
  protected readonly form = new FormGroup({
    name: new FormControl("", Validators.required),
    email: new FormControl(""),
    tel: new FormControl("", [Validators.required])
  });

  onSubmit() {
    if (this.form.valid) {
      // Envoi du formulaire

    }
  }
}
