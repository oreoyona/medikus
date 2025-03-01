import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./common/header/header.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'medikus';
  route = inject(ActivatedRoute)
  isHomeCharged = false

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      if (url[0].path == "" || "home") {
        this.isHomeCharged = true;
      }
    });

  }
}
