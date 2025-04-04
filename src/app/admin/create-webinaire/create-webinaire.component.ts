import { Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CkeditorComponent } from "../../ckeditor/ckeditor.component";
import { WebinaireService } from './webinaire.service';
import { Webinaire } from '../../common/infercaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-create-webinaire',
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    CkeditorComponent
],
  templateUrl: './create-webinaire.component.html',
  styleUrl: './create-webinaire.component.scss',
  providers: [provideNativeDateAdapter()]
})
export class CreateWebinaireComponent {

  fb =  inject(NonNullableFormBuilder)
  webinaireService = inject(WebinaireService)
  destroyRef = inject(DestroyRef)

  errorMessage: WritableSignal<string | null> = signal(null)
  successMessage: WritableSignal<string | null> = signal(null)

  newWebinaireFormGroup = this.fb.group({
    title: [''],
    description: [''], 
    date: [''],
    instructor: [''], 
    inscriptionLink: [''], 
    imageUrl: [''], 
    videoLink: ['']
  })


  saveForm(){
    if(this.newWebinaireFormGroup.valid){
      const newWebinaire: Webinaire = {
        title: this.newWebinaireFormGroup.get('title')?.value!,
        description: this.newWebinaireFormGroup.get('description')?.value!,
        date: this.newWebinaireFormGroup.get('date')?.value!,
        instructor: this.newWebinaireFormGroup.get('instructor')?.value!,
        inscriptionLink: this.newWebinaireFormGroup.get('inscriptionLink')?.value!,
        imageUrl: this.newWebinaireFormGroup.get('imageUrl')?.value!,
        videoLink: this.newWebinaireFormGroup.get('videoLink')?.value!,

      }
      this.webinaireService.createWebinaire(newWebinaire)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.errorMessage.set("Une erreur est survenue. Veuillez essayer plustard")
          return throwError( () => error)
        })
      )

      .subscribe((res) => {
        this.successMessage.set("Le Webinaire a été créé et programmé pour le " + this.newWebinaireFormGroup.get('data')?.value!)

      })
    }

    else{
      this.errorMessage.set("Le formulaire est invalide. Veuillez renseigner tous les champs")
    }

  }

}
