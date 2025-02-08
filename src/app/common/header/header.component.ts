import { ChangeDetectorRef, Component, inject, OnInit, output, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { bPoint760px, HeaderService } from '../services/header.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  //inject the HomeService inside the homeService member
  private homeService = inject(HeaderService);

  //inject the BreakPointObserver to detect programmatically screen resizing
  private bo = inject(BreakpointObserver);

  //define the dialog menu
  readonly dialog = inject(MatDialog);

  //inject the change detection strategy
  private cdr = inject(ChangeDetectorRef);
  navigation = this.homeService.navigation;

  mobile = false;
  showMenu = signal(true);

  //component methods
  openDialog(): void {
    this.showMenu.set(false);
    const dialogRef = this.dialog.open(HeaderMobileComponent, {
      height: '100vh',
      width: '60vw',
    })

    //subscribe to the event emitted by the dialog once a link is clicked

    dialogRef.afterClosed().subscribe(() => {
      this.showMenu.set(true);
      this.cdr.markForCheck();
    });

    dialogRef.componentInstance.closeDialog.subscribe(() => {
      this.showMenu.set(true);
      dialogRef.close();

    })
  }


  ngOnInit() {
    this.bo.observe(bPoint760px).subscribe(() => {
      this.mobile = true;
      this.cdr.markForCheck()
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
            <p (click)="closeOnLinkClick()">
                <a routerLink={{el.link}}>{{el.titre}}</a>
            </p>
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
export class HeaderMobileComponent{
    //inject the HomeService navigation
    navigation = inject(HeaderService).navigation;


    private dialogRef = inject(MatDialogRef);

    //outputs an event when triggered
    closeDialog = output<boolean>();

    closeOnLinkClick() {
        this.closeDialog.emit(true);
        this.dialogRef.close()
      }
}

