import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ProfilePictureComponent } from "../profile-picture/profile-picture.component";
import { User } from '../infercaces';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderService } from '../services/header.service';
import { Subject, takeUntil, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    ProfilePictureComponent,
    RouterLinkActive,
    MatProgressSpinnerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Added for performance
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Inject services
  private headerService = inject(HeaderService);
  private breakpointObserver = inject(BreakpointObserver);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals for state management
  isMobile = signal(false);
  showMobileMenu = signal(false);
  isLoggedIn = computed(() => this.authService.isAuthenticated());
  user: User | null = null;
  navigation = signal<any[]>([]);
  isLoggingOut = signal(false);

  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef)

  ngOnInit() {
    this.authService.currentUserSubject.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
    });

    this.authService.authStatus$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateNavigation();
    });

    this.updateNavigation(); // Initial navigation setup

    this.breakpointObserver.observe('(max-width: 760px)')
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateNavigation() {
    this.headerService.checkTheNav(this.authService);
    this.navigation.set([...this.headerService.navigation]);
  }

  logout() {
    this.isLoggingOut.set(true);
    timer(2000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() =>{
      this.authService.logout();
    })
    
  }

  openMobileMenu(): void {
    this.showMobileMenu.set(true);
    this.dialog.open(HeaderMobileComponent, {
      height: '100vh',
      width: '100vw',
      panelClass: 'mobile-menu-dialog' //Custom class for no padding
    });
  }
}

//MOBILE HEADER COMPONENT


@Component({
  template: `
    <div class="mobile-menu">
      <button mat-icon-button class="close-button" (click)="closeMenu()">
        <mat-icon>close</mat-icon>
      </button>
      <nav>
        @for (item of navigation(); track $index) {
          @if (item.link === 'logout') {
            <button mat-raised-button type="button" (click)="logoutAndClose()">

                    @if(isLoggingOut()){
                        <mat-spinner diameter="20"></mat-spinner>
                    }
                    @else {
                        {{item.titre}}

                    }
            </button>
          } @else {
            <a mat-button routerLink="/{{ item.link }}" (click)="closeMenu()">{{ item.titre }}</a>
          }
        }
      </nav>
    </div>
  `,
  styles: `
    .mobile-menu {
      display: flex;
      flex-direction: column;
      height: 100%;
      align-items: center;
      justify-content: center;
      background-color: #fff; // Or any appropriate background
    }
    .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
    nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }
    a{
      color: black;
    }
  `,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
})
export class HeaderMobileComponent {
  // inject the HomeService navigation
  navigation = computed(() => this.headerService.navigation);
  authService = inject(AuthService);
  headerService = inject(HeaderService);
  dialogRef = inject(MatDialogRef<HeaderMobileComponent>);
  isLoggingOut = signal(false);

  logoutAndClose() {
    this.isLoggingOut.set(true);
    timer(2000).subscribe(() => {
      this.authService.logout();
      this.closeMenu();
    })
   
  }

  closeMenu() {
    this.dialogRef.close();
  }
}
