import { Component, DestroyRef, inject, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { interval, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ConfigService } from '../config.service';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  public countdown: number = 0;
  public formattedTime: string = '00:00:00';
  public isLoading = true;
  public returnUrl = '/';
  public estimatedEndTime: Date = new Date();
  
  private destroyRef = inject(DestroyRef);
  private configService = inject(ConfigService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private checkInterval = 30000; // Check every 30 seconds
  private countdownSubscription?: Subscription;
  private maintenanceCheckSubscription?: Subscription;

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initializeMaintenanceCheck();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.countdownSubscription?.unsubscribe();
    this.maintenanceCheckSubscription?.unsubscribe();
  }

  private initializeMaintenanceCheck(): void {
    // Initial check
    this.checkMaintenanceState();

    // Set up periodic checking
    this.maintenanceCheckSubscription = timer(0, this.checkInterval)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.configService.getSettings())
      )
      .subscribe({
        next: (config) => {
          if (!config.isMaintenance) {
            this.router.navigateByUrl(this.returnUrl);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  private startCountdown(): void {
    // Set estimated end time (1 hour from now)
    this.estimatedEndTime = new Date(Date.now() + 3600 * 1000);
    
    this.countdownSubscription = interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const now = new Date();
        const diff = Math.floor((this.estimatedEndTime.getTime() - now.getTime()) / 1000);
        
        this.countdown = diff > 0 ? diff : 0;
        this.formattedTime = this.formatTime(this.countdown);
        
        // Auto-refresh page when countdown reaches 0 (optional)
        if (this.countdown <= 0) {
          window.location.reload();
        }
      });
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  public tryAgain(): void {
    this.isLoading = true;
    this.configService.getSettings()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (config) => {
       //if the maintenance has been checked to false, redirect to home
        if (!config.isMaintenance) {
          console.log("Maintenance mode off")
          this.route.data.subscribe((data) => console.log(data))
          this.router.navigate(['/']);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }


    /** Checks if the maintenance mode is activated or not. If not, redirect the user to the home page */
    private checkMaintenanceState() {
      if (!this.configService.isMaintenance) {
        this.router.navigate(['/']);
      }
      
    }
}



