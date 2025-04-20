import { ChangeDetectorRef, Component, computed, inject, OnDestroy, OnInit, output, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { bPoint760px, HeaderService } from '../services/header.service';
import { AuthService } from '../../auth/auth.service';
import { ProfilePictureComponent } from "../profile-picture/profile-picture.component";
import { User } from '../infercaces';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    RouterLink, 
    ProfilePictureComponent, 
    RouterLinkActive,
    MatProgressSpinner
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  //inject the HomeService inside the homeService member
  private headerService = inject(HeaderService);

  //inject the BreakPointObserver to detect programmatically screen resizing
  private bo = inject(BreakpointObserver);

  //define the dialog menu
  readonly dialog = inject(MatDialog);

  //inject the auth service
  private authService = inject(AuthService)


  //inject change Detection
  private cdr = inject(ChangeDetectorRef)

  mobile = false
  showMenu = signal(true)
  isLogged = computed(() => this.authService.isAuthenticated()); // Use computed signal
  user: User | null = null
  navigation!: any
  handlingLogginOut = false







  //component methods


  logout() {
    this.handlingLogginOut = true
    this.authService.logout()
  }

  openDialog(): void {
    this.showMenu.set(false);
    const dialogRef = this.dialog.open(HeaderMobileComponent, {
      height: '100vh',
      width: '100vw',
    })

    //subscribe to the event emitted by the dialog once a link is clicked

    dialogRef.afterClosed().subscribe(() => {
      this.showMenu.set(true);
    });

    dialogRef.componentInstance.closeDialog.subscribe(() => {
      this.showMenu.set(true);
      dialogRef.close();

    })
  }



  ngOnInit() {
    this.authService.currentUserSubject.subscribe(user => this.user = user);
    this.authService.authStatus$.subscribe(() => {
        this.headerService.checkTheNav(this.authService);
        this.navigation = [...this.headerService.navigation];
        this.cdr.markForCheck(); // Trigger change detection
    });
    this.headerService.checkTheNav(this.authService);
    this.navigation = [...this.headerService.navigation];

    this.bo.observe(bPoint760px).subscribe(() => {
      this.mobile = true;


    })


    





  }
}
















































///Another component for the Header on Mobile and smaller screens

@Component({
  template: `
        <div class="menu">
            <button mat-icon-button class="close-btn" (click)="closeOnLinkClick()">
                <mat-icon>close</mat-icon>
            </button>

           @for(el of navigation; track el){
            @if(el.link == "logout"){
              <button mat-raised-button type="buttom" (click)=logout()>{{el.titre}}</button>

            }@else{
              <p (click)="closeOnLinkClick()">
                <a routerLink={{el.link}}>{{el.titre}}</a>
            </p>
            }
            
            
           }

        </div>
    
    `,
  styles: `.menu{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
     
      flex-wrap: wrap;
  
      .close-btn{
          position: absolute;
          top: 10px;
          right: 10px;
          
      }
  
      p{
          a{
              all: unset;
          }
          cursor: pointer;
  
          :hover{
              text-decoration: underline;
          }
          
      }
  }`,

  imports: [RouterLink, MatIconModule, MatButtonModule]

})
export class HeaderMobileComponent implements OnInit {
  ngOnInit(): void {
    //checks if the nav has the corrected number of items[login or logout links ]
    this.headerService.checkTheNav(this.authService)

    //updates the navigation array
    this.navigation = this.headerService.navigation;


  }

  //inject the HomeService navigation
  navigation!: any
  authService = inject(AuthService)
  headerService = inject(HeaderService)
  private cd = inject(ChangeDetectorRef)
  private dialogRef = inject(MatDialogRef);

  //outputs an event when triggered
  closeDialog = output<boolean>();

  closeOnLinkClick() {
    this.closeDialog.emit(true);
    this.dialogRef.close()

    console.log()
  }

  logout() {
    this.authService.logout()
  }
}

