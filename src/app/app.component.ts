/**
 * @fileoverview Ce fichier contient le composant racine de l'application, AppComponent.
 * Il gère la logique globale de l'application comme le chargement, les animations
 * de route et le mode de maintenance.
 *
 * @description
 * Le composant AppComponent est le point d'entrée de l'application. Il contient
 * des fonctionnalités partagées par toutes les pages.
 */
import { Component, inject, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { animationsArray } from './animations';
import { FooterComponent } from "./common/footer/footer.component";
import { ConfigService } from './config.service';
import { filter, takeUntil } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { MaintenanceComponent } from './maintenance/maintenance.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: animationsArray
})
export class AppComponent implements OnInit, OnDestroy {
  // Propriété pour gérer l'affichage d'un indicateur de chargement.
  // Initialisée à false, elle peut être activée lors d'opérations asynchrones.
  loading: boolean = false;

  // Le titre de l'application, utilisé pour la balise <title> du document ou pour d'autres affichages.
  title = 'medikus';

  // Injecte ActivatedRoute pour accéder aux informations sur l'URL de la route active.
  // L'injection avec `inject` est la méthode moderne pour les composants autonomes.
  route = inject(ActivatedRoute);

  // Indicateur pour savoir si la page d'accueil est chargée.
  // Utilisé pour la logique conditionnelle liée à l'affichage de la page d'accueil.
  isHomeCharged = false;

  // Indique si l'API YouTube a été chargée.
  // Permet de s'assurer que l'API n'est chargée qu'une seule fois.
  apiLoaded = false;

  // Indique si l'application est en mode de maintenance.
  // Déterminé à partir du service de configuration.
  isMaintenanceMode = false;

  // Un Subject utilisé pour gérer la désinscription des Observables lors de la destruction du composant,
  // afin d'éviter les fuites de mémoire.
  private destroy$ = new Subject<void>();

  /**
   * @description
   * Le constructeur injecte les services et les dépendances nécessaires au composant.
   * @param renderer Service Renderer2 pour manipuler le DOM de manière sécurisée.
   * @param element ElementRef pour obtenir une référence à l'élément hôte du composant.
   * @param configService Service pour obtenir les paramètres de configuration de l'application.
   * @param router Service Router pour naviguer entre les vues.
   */
  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    public configService: ConfigService,
    private router: Router
  ) { }

  /**
   * @description
   * Prépare la route pour l'animation. Elle retourne la valeur d'animation définie
   * dans les données de la route ou un identifiant spécifique si le composant est en maintenance.
   * @param outlet Le RouterOutlet du composant.
   * @returns Le nom de l'animation à déclencher ou `undefined`.
   */
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] ||
      (outlet?.isActivated && outlet.component === MaintenanceComponent ? 'MaintenancePage' : undefined);
  }

  /**
   * @description
   * Méthode du cycle de vie ngOnInit, appelée après la création du composant.
   * C'est ici que les initialisations se produisent.
   */
  ngOnInit(): void {
    // Ajoute le schéma JSON-LD d'organisation au <head> du document pour le SEO.
    this.addOrganizationSchema();
    // Met en place la surveillance des changements de route.
    this.setupRouteMonitoring();
    // Charge l'API YouTube pour les vidéos.
    this.loadYouTubeAPI();
    // Vérifie si l'application est en mode de maintenance.
    this.checkMaintenanceStatus();
  }

  /**
   * @description
   * Méthode du cycle de vie ngOnDestroy, appelée juste avant la destruction du composant.
   * Permet de nettoyer les souscriptions pour éviter les fuites de mémoire.
   */
  ngOnDestroy(): void {
    // Émet une valeur pour notifier à tous les Observables de se désinscrire.
    this.destroy$.next();
    // Termine le Subject pour libérer les ressources.
    this.destroy$.complete();
  }

  /**
   * @description
   * Méthode privée pour ajouter un schéma de données structurées (JSON-LD)
   * de type "Organization" au document HTML.
   */
  private addOrganizationSchema(): void {
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Medikus Impulse",
      "url": "https://medikus-impulse.com",
      "logo": "https://medikus-impulse.com/logo.svg"
    });
    this.renderer.appendChild(this.element.nativeElement.ownerDocument.head, script);
  }

  /**
   * @description
   * Méthode privée pour surveiller les changements d'URL de la route.
   * Met à jour la propriété `isHomeCharged` si l'utilisateur est sur la page d'accueil.
   */
  private setupRouteMonitoring(): void {
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(url => {
      this.isHomeCharged = url[0]?.path === "" || url[0]?.path === "home";
    });
  }

  /**
   * @description
   * Méthode privée pour charger l'API JavaScript d'iframe de YouTube.
   * Ne la charge qu'une seule fois.
   */
  private loadYouTubeAPI(): void {
    if (!this.apiLoaded && typeof document !== 'undefined') {
      try {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
        this.apiLoaded = true;
      } catch (err) {
        console.warn('YouTube API loading error:', err);
      }
    }
  }

  /**
   * @description
   * Méthode privée pour vérifier l'état du mode de maintenance de l'application
   * en utilisant le service `ConfigService`.
   */
  private checkMaintenanceStatus(): void {
    this.configService.appConfig.pipe(takeUntil(this.destroy$)).subscribe({
      next: (config) => {
        // Met à jour l'état du mode de maintenance et désactive l'indicateur de chargement.
        this.isMaintenanceMode = config?.isMaintenance || false;
        this.loading = false;
      },
      error: (err) => {
        // Gère les erreurs et désactive le mode de maintenance et l'indicateur de chargement.
        console.error('Error checking maintenance status:', err);
        this.isMaintenanceMode = false;
        this.loading = false;
      }
    });
  }


  private checkAppSettings(){
    
  }
}
