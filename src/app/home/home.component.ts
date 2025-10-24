import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { UpperCasePipe, SlicePipe } from '@angular/common';
import { MatGridListModule } from "@angular/material/grid-list";
import { CourseData, CourseService } from '../admin/course.service';
import { HeaderComponent } from "../common/header/header.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BannerComponent } from "../banner/banner.component";
import { HelpersService } from '../common/services/helpers.service';
import { catchError, EMPTY, finalize, forkJoin, map, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Webinaire } from '../common/infercaces';
import { WebinaireService } from '../admin/create-webinaire/webinaire.service';

@Component({
  selector: 'app-home',
  imports: [
    MatIconModule, RouterLink, MatButtonModule, UpperCasePipe,
    MatCardModule, MatGridListModule, SlicePipe, HeaderComponent, MatProgressSpinnerModule,
    
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  courseService = inject(CourseService);
  courses!: CourseData[] |  null;
  articlesToShow = 6; // or any number you want
  bannerImageUrl = 'banner.webp'; // Replace with your image URL
  bannerTitle = 'Medikus Impulse';
  bannerSubtitle = 'Pour la promotion de la formation médicale continue à Lubumbashi et partout en RDC !';
  destroyRef = inject(DestroyRef)
  hs = inject(HelpersService)
  ws = inject(WebinaireService)
  recentWebinaires: Webinaire[] | null = null


  loading = true;
  error: string | null = null;
  imageLoading: { [key: string]: boolean } = {}; // Track loading state for each image


  ngOnInit(): void {

    this.loadData()
  }


  private loadData(): void {
    this.loading = true;
    this.error = null;

    const recentWebinaires$ = this.ws.getWebinaires().pipe(
      map((response: any) => {
        return (response.data as Webinaire[] || [])
          .map(webinaire => ({
            ...webinaire,
            date: new Date(webinaire.date!),
          }))
          .filter(webinaire => webinaire.date > new Date())
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 1);
      }),
      // Initialize imageLoading state for each webinaire
      map(webinaires => {
        webinaires.forEach(webinaire => {
          this.imageLoading[webinaire.id as any] = true;
          const img = new Image();
          img.onload = () => {
            this.imageLoading[webinaire.id as any] = false;
          };
          img.onerror = () => {
            this.imageLoading[webinaire.id as any] = false;
            // Handle image loading error if needed
            console.error(`Failed to load image for webinaire ${webinaire.id}`);
          };
          img.src = this.getImgUrl(webinaire.imageUrl!);
        });
        return webinaires;
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Erreur lors de la récupération des webinaires récents:', err);
        return of([]);
      })
    );

    const courses$ = this.courseService.getCourses().pipe(
      map((response: any) => (response?.data as CourseData[] || []).slice(0, 5)),
      catchError((err: HttpErrorResponse) => {
        console.error('Erreur lors de la récupération des cours:', err);
        this.courses = null;
        return of(null);
      })
    );

    forkJoin({ recentWebinaires: recentWebinaires$, courses: courses$ })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (results) => {
          this.recentWebinaires = results.recentWebinaires;
          this.courses = results.courses;
        },
        error: (err) => {
          console.error('Erreur globale lors du chargement des données:', err);
          this.error = 'Erreur lors du chargement des données. Veuillez réessayer plus tard.';
        },
      });
  }

  getImgUrl(url: string | null): string {
    const validatedUrl = this.hs.validateAndReturnUrl(url);
    if (validatedUrl) {
      return validatedUrl;
    } else {
      return 'info-banner.webp';
    }
  }

  ruban = [
    { titre: 'Apprendre', link: 'learn' },
    { titre: 'Abonnement', link: 'about', fragment: 'subscribe' },
    { titre: 'Prochaines Activités', link: 'events' },
    { titre: 'Nous Rejoindre', link: 'contact', fragment: 'join' },
    { titre: 'Blog', link: 'blog' }
  ];



}