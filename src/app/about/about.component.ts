import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../common/header/header.component";
import { FooterComponent } from "../common/footer/footer.component";
import { AboutService } from './about.service';
import { UpperCasePipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion'
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-about',
  imports: [HeaderComponent, FooterComponent, UpperCasePipe, MatExpansionModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent{

  pageTitle = `à-propos`;
  aboutService = inject(AboutService);
  aboutTextArray = this.aboutService.about;
  
}
