import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppConfig, ConfigService } from '../config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCardModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  configService = inject(ConfigService);
  destroyRef = inject(DestroyRef);
  loading = false;
  message: string | null = null;
  
  // Initialise l'objet config avec des valeurs par défaut pour éviter les erreurs.
  config: AppConfig = {
    isMaintenance: false,
    rubanOnEditor: false,
    horizontalRubanOnMobile: false,
    authForAll: false,
    commentsOn: false,
  };

  ngOnInit(): void {
    // Charge l'état actuel des paramètres de l'application
    this.loadAppSettings();
  }

  /**
   * Met à jour les paramètres de l'application via le service de configuration.
   * Cette méthode envoie l'objet 'config' entier au backend.
   */
  updateParam() {
    this.loading = true;
    
    // Pour une mise à jour complète, nous pouvons envoyer l'objet entier.
    // Votre endpoint Python mis à jour devra également gérer cette approche.
    this.configService.updateSettings('config', JSON.stringify(this.config)).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        this.loading = false;
        this.message = "Une erreur est survenue lors de l'enregistrement.";
        return of(err);
      })
    ).subscribe(() => {
      this.loading = false;
      this.message = "Vos modifications ont été enregistrées avec succès.";
    });
  }

  /**
   * Récupère les paramètres actuels de l'application via le service.
   * L'abonnement met à jour l'objet 'config' du composant.
   */
  private loadAppSettings() {
    this.configService.getSettings()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: AppConfig) => {
        this.config = res;
      });
  }
}