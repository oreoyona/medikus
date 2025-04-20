import { JsonPipe, NgFor } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingButtonDirective } from '../../common/directives/loading-button.directive';
import { LoadingSpinnerComponent } from '../../common/loading-spinner/loading-spinner.component';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'ckeditor5-premium-features';
import { AuthService } from '../../auth/auth.service';
import { HelpersService } from '../../common/services/helpers.service';
import { userResponse, UserService } from '../users/user.service';
import { MatDialog } from '@angular/material/dialog';
import { catchError, of, Subscription, timer } from 'rxjs';
import { DeleteDialogComponent } from '../edit-course/delete-dialog.component';
import { WebinaireService } from '../create-webinaire/webinaire.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Webinaire } from '../../common/infercaces';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxMatTimepickerModule, NgxMatTimepickerComponent } from 'ngx-mat-timepicker';
import { MatIconModule } from '@angular/material/icon';
import { ImageUploadComponent } from "../../common/image-uploader.component";

@Component({
  selector: 'app-edit-webinaire-component',
  imports: [
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    LoadingSpinnerComponent,
    LoadingButtonDirective,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    NgxMatTimepickerModule,
    MatIconModule,
    ImageUploadComponent
], templateUrl: './edit-webinaire-component.component.html',
  styleUrl: './edit-webinaire-component.component.scss',
  providers: [provideNativeDateAdapter()]
})
export class EditWebinaireComponent implements OnInit, OnDestroy {
  @ViewChild('picker') picker: any;

  constructor(private fb: NonNullableFormBuilder) {

    this.editWebinaireForm = this.fb.group({
      title: [''],
      date: [''],
      instructor: [''],
      description: [''],
      videoLink: [''],
      imgUrl: [''],
      inscriptionLink: [''],
      time: ['']
    })
  }
  ngOnDestroy(): void {
    this.paramMapSubscription.unsubscribe()
  }

  ngOnInit(): void {
    this.paramMapSubscription = this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) {
        const webinaireId = Number(this.id);
        if (isNaN(webinaireId)) {
          this.errorMessage.set("Invalid user ID provided.");
          this.loading = false;
          return;
        }

        this.loading = true;
        this.ws.getWebinaire(webinaireId).subscribe({
          next: (res: any) => {
            const webinaire = res.data as Webinaire



            //patch the values in the form
            this.editWebinaireForm.patchValue({
              title: webinaire.title,
              date: new Date(webinaire.date!),
              time: this.hs.formatTime(new Date(webinaire.date!)),
              videoLink: webinaire.videoLink,
              imgUrl: webinaire.imageUrl,
              instructor: webinaire.instructor,
              inscriptionLink: webinaire.inscriptionLink,
              description: webinaire.description
            });

            //the view is now ready to be displayed
            this.loading = false;
          },
          error: (err) => {
            console.error("Error fetching user:", err);
            this.errorMessage.set("Error fetching user. Please try again later.")
            this.loading = false;
          }
        });
      } else {
        this.errorMessage.set("No user ID provided.")
      }
    });
  }






  authService = inject(AuthService)
  ws = inject(WebinaireService)
  hs = inject(HelpersService)
  router = inject(Router)
  route = inject(ActivatedRoute)
  private destroyRef = inject(DestroyRef)
  readonly dialog = inject(MatDialog)


  id: any
  user!: User
  loading = true; // Add a loading indicator
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  private paramMapSubscription!: Subscription;
  deleteLoading = false;
  saveLoading = false
  editWebinaireForm: any;



  save() {

    this.saveLoading = true

    if (this.editWebinaireForm.valid) {
      const selectedDate: Date = this.editWebinaireForm.get('date').value;
      const selectedTime: string = this.editWebinaireForm.get('time').value;

      // Function to combine date and time
      const combinedDateTime = this.combineDateTime(selectedDate, selectedTime);



      const newWebinnaire = {

        id: Number(this.authService.currentUser?.id),
        title: this.editWebinaireForm.get('title').value,
        instructor: this.editWebinaireForm.get('instructor').value,
        imgUrl: this.editWebinaireForm.get('imgUrl').value,
        videoLink: this.editWebinaireForm.get('videoLink').value,
        date: combinedDateTime,
        inscriptionLink: this.editWebinaireForm.get('inscriptionLink').value,
        description: this.editWebinaireForm.get('description').value,

      }

      this.updateWebinaire(newWebinnaire);

    }


  }


  private combineDateTime(date: Date, time: string) {
    if (!date || !time) {
      return null; // Or handle the error as appropriate
    }

    const [timePart, ampm] = time.trim().split(' ');
    const [hoursStr, minutesStr] = timePart.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (ampm && ampm.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
      hours = 0; // Midnight (12 AM) should be 0 in 24-hour format
    }

    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0); // Optionally set seconds and milliseconds to 0
    newDate.setMilliseconds(0);

    return newDate;
  }





  private updateWebinaire(newWebinnaire: any) {
    this.ws.editWebinaire(Number(this.id), newWebinnaire)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err: HttpErrorResponse) => {
          if (err.status == 400) {
            this.errorMessage.set("Les informations n'ont pas été enregistrées. Réessayez ultérieurement")
            timer(10000).subscribe(() => this.errorMessage.set(null));

            this.hs.goToTop()
          }

          return of(err)
        })
      )

      .subscribe((res: any) => {
        if (res.code == 201) {
          this.saveLoading = false
          this.successMessage.set("Les informations du webinaire ont bien été modifiées et sauvegardées")
          this.hs.goToTop()
          timer(10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.successMessage.set(null));
        } else {
          this.saveLoading = false
          this.hs.goToTop()
          this.errorMessage.set("Les informations n'ont pas été enregistrées. Réessayez ultérieurement")
        }
      });
  }

  deleteWebinaire() {
    const dialogRef = this.dialog.open(DeleteDialogComponent);
    
    dialogRef.componentInstance.confirmed.subscribe(() => {
      this.deleteLoading = true; // Set loading to true before API call

      const webinaireId = Number(this.id);
      if (isNaN(webinaireId)) {
        console.error("Invalid webinaire ID:", this.id);
        this.deleteLoading = false; // Hide the loader even on error
        return;
      }

      this.ws.deleteWebinaire(webinaireId)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError((err: HttpErrorResponse) => {
            if (err.status == 404) {
              this.errorMessage.set("Une erreur est survenue.")
              this.hs.goToTop()
            }
            return of(err)

          })
        )
        .subscribe((res: any) => {
          this.deleteLoading = false; // Hide the loader
          this.router.navigate(['admin', { outlets: { admin: ['webinaires'] } }]);
        });
    });
  }



}
