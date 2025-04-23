import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { animationsArray } from './animations';
import { FooterComponent } from "./common/footer/footer.component";
import { ConfigService } from './config.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: animationsArray
})
export class AppComponent implements OnInit {
  constructor(public configService: ConfigService) { }


  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  title = 'medikus';
  route = inject(ActivatedRoute)
  isHomeCharged = false
  apiLoaded = false;
  isMaintenanceMode = false;



  ngOnInit(): void {

    this.route.url.subscribe(url => {
      if (url[0].path == "" || "home") {
        this.isHomeCharged = true;
      }
    });

    if (!this.apiLoaded) {
      try {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
        this.apiLoaded = true;
      }

      catch (err) {
        console.warn(err)
      }

    }
  }


}
