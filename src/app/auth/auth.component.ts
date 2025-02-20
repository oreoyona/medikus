import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from "../common/header/header.component";
import { FooterComponent } from "../common/footer/footer.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth.service';
import { UpperCasePipe } from '@angular/common';
import { InscriptionFormComponent } from "./inscription/inscription-form.component";
import { LoginFormComponent } from "./login/login.component-form";
import { SocialComponent } from "../common/social/social.component";




@Component({
  selector: 'app-inscription',
  imports: [
    HeaderComponent,
    FooterComponent,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    UpperCasePipe,
    InscriptionFormComponent,
    LoginFormComponent,
    
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