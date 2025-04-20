import { Component, OnInit, OnDestroy, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { WebinaireService } from '../admin/create-webinaire/webinaire.service';
import { Webinaire } from '../common/infercaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DatePipe, NgIf } from '@angular/common';
import { HelpersService } from '../common/services/helpers.service';
import { HeaderComponent } from "../common/header/header.component";
import { MatButtonModule } from '@angular/material/button';
import { FormatDatePipe } from '../common/pipes/format-date.pipe';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { BreakpointService } from '../common/services/breakpoint-service.service';

@Component({
  selector: 'app-show-webinaire',
  imports: [
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    HeaderComponent,
    MatButtonModule,
    FormatDatePipe,
    YouTubePlayerModule
  ],
  templateUrl: './show-webinaire.component.html',
  styleUrl: './show-webinaire.component.scss',
})
export class ShowWebinaireComponent implements OnInit {
  now = new Date().toLocaleTimeString()
  webinaireId: string | null = null;
  webinaire: Webinaire | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  isLive: boolean = false;
  isPast: boolean | null = false;
  messages: { sender: string; text: string }[] = [];
  newMessage: string = '';


  getDate(date: any){
    return new Date(date)
  }




  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private webinaireService: WebinaireService,
    public hs: HelpersService,
    public bs: BreakpointService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.webinaireId = params.get('id') // Assuming your route parameter for the ID is 'id'

      if (this.webinaireId) {
        this.loadWebinaire(this.webinaireId);
      } else {
        this.errorMessage = 'Webinaire ID not found in the URL.';
        this.loading = false;
      }
    });
  }

  loadWebinaire(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.webinaireService.getWebinaire(Number(id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (webinaire: any) => {
          this.webinaire = webinaire.data;
          this.loading = false;
          this.checkWebinaireStatus();

        },
        error: (error) => {
          console.error('Error loading webinaire:', error);
          this.errorMessage = 'Failed to load webinaire. Please try again later.';
          this.loading = false;
        }
      });
  }


  private checkWebinaireStatus(): void {
    if (this.webinaire) {
      const now = new Date();
      const webinaireDate = new Date(this.webinaire.date!);
      let endDate = new Date(this.webinaire.endDate!)


      this.isLive = now >= webinaireDate && (!endDate || now <= endDate);
      this.isPast = now > webinaireDate && endDate && now > endDate;
    }
  }




  addToCalendar(): void {
    if (this.webinaire?.date) {
      const startDate = new Date(this.webinaire.date);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour for default duration

      const title = this.webinaire.title;
      const description = this.webinaire.description;
      const location = 'Online';

      // Convert local Date objects to UTC format for Google Calendar
      const getUTCDateString = (date: Date): string => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = '00';
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
      };

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${getUTCDateString(startDate)}/${getUTCDateString(endDate)}&text=${encodeURIComponent(title)}&details=${encodeURIComponent(this.webinaire.description!)}&location=${encodeURIComponent(location)}`;

      window.open(googleCalendarUrl, '_blank');
    } else {
      console.error('La date du webinaire est manquante.');
      // Optionally show a user-friendly message
    }
  }


}