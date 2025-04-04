import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { UpperCasePipe, DatePipe, SlicePipe, NgIf, NgForOf, JsonPipe } from '@angular/common';
import { MatGridListModule } from "@angular/material/grid-list";
import { CourseData, CourseService } from '../admin/course.service';
import { HeaderComponent } from "../common/header/header.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BannerComponent } from "../banner/banner.component";
import { HelpersService } from '../common/services/helpers.service';

@Component({
  selector: 'app-home',
  imports: [
    MatIconModule, RouterLink, MatButtonModule, UpperCasePipe, DatePipe,
    MatCardModule, MatGridListModule, SlicePipe, HeaderComponent, MatProgressSpinnerModule,
    BannerComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  courseService = inject(CourseService);
  courses!: CourseData[];
  articlesToShow = 6; // or any number you want
  bannerImageUrl = 'banner.webp'; // Replace with your image URL
  bannerTitle = 'Medikus Impulse';
  bannerSubtitle = 'Pour la promotion de la formation médicale continue à Lubumbashi et partout en RDC !';
  gridCols = 3; // Initial number of columns

  hs = inject(HelpersService)

  ngOnInit(): void {
 
    this.courseService.getCourses().subscribe((res: any) => {
      this.courses = res.data.slice(0, 5);
    });
  }


 

  getImgUrl(url: string | null): string {
    const validatedUrl = this.hs.validateAndReturnUrl(url); // Call your validation
  
    if (validatedUrl) {
      return validatedUrl; // Return the valid URL if it's valid
    } else {
      return 'info-banner.webp'; // Return the fallback URL if it's invalid
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