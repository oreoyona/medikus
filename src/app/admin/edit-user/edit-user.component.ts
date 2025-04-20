import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { userResponse, UserService } from '../users/user.service';
import { role, User } from '../../common/infercaces';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../edit-course/delete-dialog.component';
import { catchError, from, of, Subscription, timer } from 'rxjs';
import { LoadingSpinnerComponent } from "../../common/loading-spinner/loading-spinner.component";
import { LoadingButtonDirective } from '../../common/directives/loading-button.directive';
import { R2StorageService } from '../../common/services/r2-storage.service';
import { HelpersService } from '../../common/services/helpers.service';
@Component({
  selector: 'app-edit-user',
  imports: [
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgFor,
    LoadingSpinnerComponent,
    LoadingButtonDirective

  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent implements OnInit, OnDestroy {


  ngOnInit(): void {

    this.paramMapSubscription = this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) {
        const userId = Number(this.id);
        if (isNaN(userId)) {
          this.errorMessage.set("Invalid user ID provided.");
          this.loading = false;
          return;
        }

        this.loading = true;
        this.userService.getUserById(userId).subscribe({
          next: (res: any) => {
            const user = res.data
            this.user = user;

            //patch the values in the form
            this.editUserForm.patchValue({
              name: user.name,
              username: user.username,
              email: user.email,
              imgUrl: user.imgUrl,
              role: user.role
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
  ngOnDestroy() {
    if (this.paramMapSubscription) {
      this.paramMapSubscription.unsubscribe();
    }
  }
  fb = inject(NonNullableFormBuilder)
  editUserForm = this.fb.group({
    name: [''],
    username: [''],
    email: [''],
    imgUrl: [''],
    role: [''],
    image: [null as File | null] // Add a form control for the image file


  })
  authService = inject(AuthService)
  userService = inject(UserService)
  hs = inject(HelpersService)
  router = inject(Router)
  route = inject(ActivatedRoute)
  id: any
  user!: User
  roles: role[] = ['admin', 'editor', 'instructor', 'subscriber']
  readonly dialog = inject(MatDialog)
  loading = true; // Add a loading indicator
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  private paramMapSubscription!: Subscription; // Add a subscription variable
  deleteLoading = false;


  save() {

    if (this.editUserForm.valid) {
      const newUser = {
        id: Number(this.authService.currentUser?.id),
        name: this.editUserForm.value.name,
        email: this.editUserForm.value.email,
        imgUrl: this.editUserForm.value.imgUrl,
        role: this.editUserForm.value.role

      }

      this.updateUser(newUser);

    }

  }

  updateUser(newUser: any) {
    this.userService.editAdminUser(Number(this.id), newUser).subscribe((res: userResponse) => {
      if (res.code == 200) {
        this.successMessage.set("Les informations de l'utilisateur ont bien été modifiées et sauvegardées")
        timer(10000).subscribe(() => this.successMessage.set(null));
      } else {
        this.errorMessage.set("Les informations n'ont pas été enreggistrées. Réessayez ultérieurement")
      }
    });
  }

  deleteAdminUser() {
    this.deleteLoading = true; // Set loading to true before API call
    const dialogRef = this.dialog.open(DeleteDialogComponent);
    dialogRef.componentInstance.confirmed.subscribe(() => {
      const userId = Number(this.id);
      if (isNaN(userId)) {
        console.error("Invalid user ID:", this.id);
        this.deleteLoading = false; // Hide the loader even on error
        return;
      }

      this.userService.deleteAdminUser(userId).subscribe({
        next: (res: any) => {
          if (res.code == 200) {
            this.deleteLoading = false; // Hide the loader
            this.router.navigate(['admin', { outlets: { admin: ['users'] } }]);
          } else {
            this.deleteLoading = false; // Hide the loader even on error
            // Handle error (e.g. show a message)
            console.error("Error deleting user:", res);
          }
        },
        error: (err) => {
          this.deleteLoading = false; // Hide the loader even on error
          console.error("Error deleting user:", err);
          // Handle error (e.g., show a message)
        }
      });
    });
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    //make the api call to cloudflare and store the image

    if (file) {
      this.hs.uploadImgeToBackend(file)
        .pipe(
          catchError((error) => {
            this.errorMessage.set("Une erreur est survenue. Veuillez réessayer plus tard")
            return of(error)
          })
        )
        .subscribe(
          (res) => {
            this.editUserForm.patchValue({ imgUrl: res.url })

          }
        )
    }

  }

}
