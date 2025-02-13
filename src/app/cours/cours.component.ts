import { Component } from '@angular/core';
import { HeaderComponent } from "../common/header/header.component";
import { FooterComponent } from "../common/footer/footer.component";
import {MatTabsModule} from '@angular/material/tabs';
import { NavigationComponent } from "../navigation/navigation.component";
@Component({
  selector: 'app-cours',
  imports: [HeaderComponent, FooterComponent, MatTabsModule, NavigationComponent],
  templateUrl: './cours.component.html',
  styleUrl: './cours.component.scss'
})
export class CoursComponent {

}
