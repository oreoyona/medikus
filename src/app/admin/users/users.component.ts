import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { User } from '../../common/infercaces';
import { UserService } from './user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingSpinnerComponent } from '../../common/loading-spinner/loading-spinner.component';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { HelpersService } from '../../common/services/helpers.service';

@Component({
  selector: 'app-users',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent,
    MatPaginatorModule,
    MatCardModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  @ViewChild('paginator') paginator!: MatPaginator;
  private cdr = inject(ChangeDetectorRef);

  router = inject(Router);
  loading = true;
  message: WritableSignal<string | null> = signal(null);
  dataSource!: MatTableDataSource<User>;
  pageSizeOptions: number[] = [];
  userService = inject(UserService);
  dataInPaginatorLength!: number;
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'action'];
  dataLoaded = false;
  helpersService = inject(HelpersService)

  constructor() { }

  ngOnInit(): void {
    this.userService.getAllUsers()
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.message.set(`Nous n'avons pas pu recupérer tous les utilisateurs.: ${this.userService.printElegantMessageErrors(err.status)}`);
          return of(err);
        })
      )
      .subscribe({
        next: data => {
          const users = data as Array<User>;
          this.dataInPaginatorLength = users.length;
          this.dataSource = new MatTableDataSource<User>([]);
          this.calculatePageSizeOptions(users.length);
          this.loading = false;
          this.dataSource.data = users;
          this.cdr.detectChanges();
          this.dataLoaded = true; // Set flag to true when data is loaded
          this.helpersService.assignPaginator(this.dataLoaded, this.paginator, this.dataSource, this.cdr)
        }
      });
  }

  ngAfterViewInit(): void {
    this.helpersService.assignPaginator(this.dataLoaded, this.paginator, this.dataSource, this.cdr)
  }

  

  public goTo(id: any) {
    const numId = Number(id);
    this.router.navigate(['admin', { outlets: { admin: ['users', `${numId}`] } }]);
  }

  private calculatePageSizeOptions(dataLength: number) {
    if (dataLength <= 5) {
      this.pageSizeOptions = [dataLength];
    } else if (dataLength <= 10) {
      this.pageSizeOptions = [5, dataLength];
    } else if (dataLength <= 25) {
      this.pageSizeOptions = [5, 10, dataLength];
    } else {
      this.pageSizeOptions = [5, 10, 25, 100, dataLength];
    }
  }
}