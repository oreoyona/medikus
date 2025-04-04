import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { CourseData, CourseService, ServerDataResponse } from '../course.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { HelpersService } from '../../common/services/helpers.service';
import { LoadingSpinnerComponent } from "../../common/loading-spinner/loading-spinner.component";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../users/user.service';

@Component({
  selector: 'app-all-courses',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './all-courses.component.html',
  styleUrl: './all-courses.component.scss'
})
export class AllCoursesComponent implements OnInit, AfterViewInit {


  ngOnInit(): void {
    this.courseService.getCourses()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.dataLoaded = true
          this.errorMessage.set(this.userService.printElegantMessageErrors((error as HttpErrorResponse).status))
          return of(error)
        })
      )
      .subscribe((res: any) => {
        const courses: CourseData[] = res.data
        this.dataSource = new MatTableDataSource<CourseData>(courses)
        this.helpersService.calculatePageSizeOptions(this.pageSizeOptions, courses.length)
        this.dataSource.data = courses
        this.cdr.detectChanges()
        this.dataLoaded = true; // Set flag to true when data is loaded
        this.helpersService.assignPaginator(this.dataLoaded, this.paginator, this.dataSource, this.cdr)
      })
  }


  ngAfterViewInit(): void {
    this.helpersService.assignPaginator(this.dataLoaded, this.paginator, this.dataSource, this.cdr)
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator


  errorMessage: WritableSignal<string | null> = signal(null)
  destroyRef = inject(DestroyRef)
  courseService = inject(CourseService)
  private router = inject(Router)
  private helpersService = inject(HelpersService)
  private userService = inject(UserService)
  dataSource!: MatTableDataSource<CourseData>
  displayedColumns: string[] = ['id', 'name', 'instructor', 'subscribers', 'action'];
  pageSizeOptions: number[] = [];
  dataLoaded = false;
  cdr = inject(ChangeDetectorRef)



  goTo(id: any) {

    const numId = Number(id)
    this.router.navigate(['admin', { outlets: { admin: ['courses', `${numId}`] } }]);
  }

}
