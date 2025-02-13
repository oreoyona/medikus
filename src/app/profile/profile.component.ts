import { Component, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProfileService } from './profile.service';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from "../common/header/header.component";

@Component({
  selector: 'app-profile',
  imports: [MatCardModule, RouterLink, MatMenuModule, MatIconModule, MatButtonModule, MatListModule, MatIconModule, MatTabsModule, MatButtonModule, HeaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  profileName = signal("");
  profileCertificats: WritableSignal<any[]> = signal([])
  courseAuthor = "Medikus"
  courseTitle = "Formation sur l'echographie"
  courseImage = "info-banner.webp"
  courseId = 1;



  constructor(private profileServie: ProfileService) { }



  ngOnInit() {
    this.profileName.set(this.profileServie.user.name)
    this.profileCertificats.set(this.profileServie.user.education)
  }


}
