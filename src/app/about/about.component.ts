import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../common/header/header.component";
import { FooterComponent } from "../common/footer/footer.component";
import { AboutService } from './about.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [HeaderComponent, FooterComponent, UpperCasePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  pageTitle = `à-propos`;
  aboutService = inject(AboutService);
  aboutTextArray = this.aboutService.about;
}
