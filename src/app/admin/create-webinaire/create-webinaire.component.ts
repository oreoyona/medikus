import { Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { WebinaireService } from './webinaire.service';
import { Webinaire } from '../../common/infercaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, throwError } from 'rxjs';
import { ImageUploadComponent } from "../../common/image-uploader.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HelpersService } from '../../common/services/helpers.service';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-create-webinaire',
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    ImageUploadComponent,
    MatProgressSpinnerModule,
    NgxMatTimepickerModule
  ],
  templateUrl: './create-webinaire.component.html',
  styleUrl: './create-webinaire.component.scss',
  providers: [provideNativeDateAdapter()]
})
export class CreateWebinaireComponent {

  fb = inject(NonNullableFormBuilder)
  webinaireService = inject(WebinaireService)
  hs = inject(HelpersService)
  destroyRef = inject(DestroyRef)
  loading = false;

  errorMessage: WritableSignal<string | null> = signal(null)
  successMessage: WritableSignal<string | null> = signal(null)

  newWebinaireFormGroup = this.fb.group({
    title: [''],
    description: [''],
    date: [''],
    time: [''],
    instructor: [''],
    inscriptionLink: [''],
    imageUrl: [''],
    videoLink: ['']
  })


  saveForm() {
    this.loading = true;
    if (this.newWebinaireFormGroup.valid) {
      const selectedDate  = this.newWebinaireFormGroup.get('date')?.value;
      const selectedTime = this.newWebinaireFormGroup.get('time')?.value;

      // Function to combine date and time
      const combinedDateTime = this.hs.combineDateTime(new Date(selectedDate!), selectedTime!);

      
      const newWebinaire: Webinaire = {
        title: this.newWebinaireFormGroup.get('title')?.value!,
        description: this.newWebinaireFormGroup.get('description')?.value!,
        date: combinedDateTime!,
        instructor: this.newWebinaireFormGroup.get('instructor')?.value!,
        inscriptionLink: this.newWebinaireFormGroup.get('inscriptionLink')?.value!,
        imageUrl: this.newWebinaireFormGroup.get('imageUrl')?.value!,
        videoLink: this.newWebinaireFormGroup.get('videoLink')?.value!,

      }
      this.webinaireService.createWebinaire(newWebinaire)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError((error) => {
            this.loading = false;
            this.errorMessage.set("Une erreur est survenue. Veuillez essayer plustard")
            this.hs.goToTop()

            return throwError(() => error)
          })
        )

        .subscribe((res) => {
          this.loading = false;
          this.hs.goToTop()
          this.newWebinaireFormGroup.reset()
          this.successMessage.set("Le Webinaire a été créé et programmé" )

        })
    }

    else {
      this.loading = false;

      this.errorMessage.set("Le formulaire est invalide. Veuillez renseigner tous les champs")
      this.hs.goToTop()

    }

  }

}
