import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle'
import { AppConfig, ConfigService } from '../config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, of } from 'rxjs';
@Component({
  selector: 'app-settings',
  imports: [
    MatCardModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  @ViewChild('maintenance') maintenance: MatSlideToggle | null = null


  congigService = inject(ConfigService)
  destroyRef = inject(DestroyRef)
  loading = false
  message: string | null = null;

  config!: AppConfig

  ngOnInit(): void {
    this.loadAppSettings()

  }

  updateParam() {
    this.loading = true
    let key = "is_maintenance_mode"
    let value = this.maintenance?.checked
    this.congigService.updateSettings(key, String(value)).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        this.loading = false
        this.message = "Une erreur est survenue. "
        return of(err)
      })
    )
      .subscribe((res) => {
        this.loading = false
        this.message = "Vos modifications ont été enregistrées"
        console.log(res)
      })

  }



  private loadAppSettings() {
    this.congigService.getSettings()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: AppConfig) => {
        this.config = res
        if (this.config.isMaintenance) {
          this.maintenance?.toggle()
        }
      })
  }

}
