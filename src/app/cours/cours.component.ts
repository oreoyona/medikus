import { Component } from '@angular/core';
import { FooterComponent } from "../common/footer/footer.component";
import {MatTabsModule} from '@angular/material/tabs';
import { NavigationComponent } from "../navigation/navigation.component";
@Component({
  selector: 'app-cours',
  imports: [FooterComponent, MatTabsModule, NavigationComponent],
  templateUrl: './cours.component.html',
  styleUrl: './cours.component.scss'
})
export class CoursComponent {

}
