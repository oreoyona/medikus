import { AfterViewInit, Component, ElementRef, inject, QueryList, ViewChildren } from '@angular/core';


import { AboutService } from './about.service';
import { UpperCasePipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion'
import { RouterLink } from '@angular/router';
import { HeaderComponent } from "../common/header/header.component";
@Component({
  selector: 'app-about',
  imports: [MatExpansionModule, HeaderComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements AfterViewInit{

  constructor(private el: ElementRef){}
  activeSection = 'about'; // Initial active section

  @ViewChildren('sectionElement')
  sectionElements!: QueryList<ElementRef>;


  pageTitle = `à-propos`;
  aboutService = inject(AboutService);
  aboutTextArray = this.aboutService.about;

  ngAfterViewInit(): void {
    this.observeSections();
  }

  scrollToSection(sectionId: string): void {
    const element = this.el.nativeElement.querySelector(`#${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = sectionId;
    }
  }

  observeSections(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      { threshold: 0.2 } // Adjust threshold as needed
    );

    this.sectionElements.forEach((element) => {
      observer.observe(element.nativeElement);
    });
  }
  
}
