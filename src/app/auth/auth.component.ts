import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth.service';
import { UpperCasePipe } from '@angular/common';
import { InscriptionFormComponent } from "./inscription/inscription-form.component";
import { LoginFormComponent } from "./login/login.component-form";
import { HeaderComponent } from "../common/header/header.component";




@Component({
  selector: 'app-inscription',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    UpperCasePipe,
    InscriptionFormComponent,
    LoginFormComponent,
    HeaderComponent
],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {
  actualText = signal("");
  socialTexte = signal("");
  authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    const isInscription = this.authService.getLastUrlStr() === "inscription";
    this.setText(isInscription ? "inscription" : "Connectez-vous");
  }

  setText(page: string) {
    this.actualText.set(page);
    this.socialTexte.set(page === "inscription" ? "S'inscrire avec: " : "Se connecter avec:");
  }
}