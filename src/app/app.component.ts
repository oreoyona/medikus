import { Component, inject, OnInit, OnDestroy, Renderer2, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { ActivatedRoute, NavigationStart, ResolveEnd, Router, RouterOutlet } from '@angular/router';
import { animationsArray } from './animations';
import { FooterComponent } from "./common/footer/footer.component";
import { ConfigService } from './config.service';
import { filter, takeUntil } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';

import { MaintenanceComponent } from './maintenance/maintenance.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: animationsArray
})
export class AppComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  title = 'medikus';
  route = inject(ActivatedRoute);
  isHomeCharged = false;
  apiLoaded = false;
  isMaintenanceMode = false;
  private destroy$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    public configService: ConfigService,
    private router: Router
  ) { }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] ||
      (outlet?.isActivated && outlet.component === MaintenanceComponent ? 'MaintenancePage' : undefined);
  }

  ngOnInit(): void {

    this.addOrganizationSchema();
    this.setupRouteMonitoring();
    this.loadYouTubeAPI();
    this.checkMaintenanceStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private addOrganizationSchema(): void {
    const script = this.renderer.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Medikus Impulse",
      "url": "https://medikus-impulse.com",
      "logo": "https://medikus-impulse.com/logo.svg"
    });
    this.renderer.appendChild(this.element.nativeElement.ownerDocument.head, script)
  }
  private setupRouteMonitoring(): void {
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(url => {
      this.isHomeCharged = url[0]?.path === "" || url[0]?.path === "home";
    });
  }

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

  private checkMaintenanceStatus(): void {
    this.configService.appConfig.pipe(takeUntil(this.destroy$)).subscribe({
      next: (config) => {
        this.isMaintenanceMode = config?.isMaintenance || false;
        this.loading = false; //  set loading to false here
      },
      error: (err) => {
        console.error('Error checking maintenance status:', err);
        this.isMaintenanceMode = false;
        this.loading = false;
      }
    });
  }

}