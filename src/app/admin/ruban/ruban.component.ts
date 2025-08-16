import { Component, inject, OnInit, OnDestroy, DestroyRef, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointService } from '../../common/services/breakpoint-service.service';
import { AuthService } from '../../auth/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../common/header/header.component";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService, AppConfig } from '../../config.service';
import { NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip'

@Component({
  selector: 'app-ruban',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    NgClass,
    MatTooltipModule
  ],
  templateUrl: './ruban.component.html',
  styleUrl: './ruban.component.scss',
})
export class RubanComponent implements OnInit {
  bp = inject(BreakpointService);
  as = inject(AuthService);
  configService = inject(ConfigService);

  mobile = this.bp.mobile;
  ruban = this.bp.getDisplayRuban;
  isAuthenticated = this.as.isAuthenticated();
  destroyRef = inject(DestroyRef);

  // Utilisation d'un signal pour stocker la configuration de l'application
  config = signal<AppConfig | null>(null);

  // Un simple signal pour contrôler l'état du ruban horizontal
  isRubanHorizontal = signal<boolean>(false);


  // Un signal pour controler l'etat du ruban quand l'editeur est active
  isRubanOnEditorOn = signal(false)

  ngOnInit(): void {
    // S'abonne à l'observable du service pour mettre à jour le signal
    // `takeUntilDestroyed` gère automatiquement la désinscription
    this.configService.appConfig
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(config => {
        if (config) {
          this.config.set(config);
          // Mettez à jour le signal du ruban horizontal ici
          this.isRubanHorizontal.set(config.horizontalRubanOnMobile || false && this.mobile());
        }
      });
  }

  // Signal calculé pour déterminer si le ruban latéral doit être affiché
  // Il ne s'affichera pas si l'éditeur est chargé ET que l'option rubanOnEditor est vraie
  showRuban = computed(() => {
    const currentConfig = this.config();
    const editorIsLoaded = this.configService.editorLoaded();

    // Le ruban ne s'affiche pas si rubanOnEditor est vrai ET que l'éditeur est chargé
    if (currentConfig?.rubanOnEditor && editorIsLoaded) {
      return false;
    }
    // Sinon, il s'affiche
    return true;
  });

  toggleRuban(): void {
    this.bp.toggleRuban();
  }
}
