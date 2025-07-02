import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { FooterComponent } from "../common/footer/footer.component";
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CourseData, CourseService } from '../admin/course.service';
import { HeaderComponent } from "../common/header/header.component";
import { RouterLink } from '@angular/router';
import { DatePipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { HelpersService } from '../common/services/helpers.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatProgressSpinnerModule

@Component({
  selector: 'app-catalogue',
  imports: [
    MatDividerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    HeaderComponent,
    RouterLink,
    DatePipe,
    MatPaginatorModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,NgIf,
    MatGridListModule,
    MatProgressSpinnerModule // Add MatProgressSpinnerModule
  ],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss'
})
export class CatalogueComponent implements OnInit {

  courseService = inject(CourseService);
  allCourses: Array<CourseData> = [];
  filteredCourses: Array<CourseData> = [];
  helperService = inject(HelpersService);
  searchValue = new FormControl("");
  pageSize = 6;
  pageIndex = 0;
  noCoursesFound = false;
  loadingCourses = true; // Add loadingCourses flag

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  categoryFilter = new FormControl('');
  instructorFilter = new FormControl('');
  categories = ["Hybride", "En Ligne", "Présentiel"];
  instructors: string[] = [];

  ngOnInit(): void {
    this.loadCourses();
    this.loadFilters();
  }

  loadFilters(): void {
    this.categories = [...new Set(this.allCourses.map(course => course.courseType).filter(Boolean))] as string[];
    this.instructors = [...new Set(this.allCourses.map(course => course.instructor?.split(';')[0]).filter(Boolean))] as string[];
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getCourses().subscribe((res: any) => {
      this.allCourses = res.data;
      this.filteredCourses = [...this.allCourses];
      this.updatePagedCourses();
      this.loadingCourses = false;
    });
  }

  getImgUrl(url: string | null): string {
    const validatedUrl = this.helperService.validateAndReturnUrl(url);
    return validatedUrl || 'info-banner.webp';
  }

 searchForm = new FormGroup({
  term: new FormControl("")
 })
  search(): void {
    let term = this.searchForm.get('term')?.value
    this.loadingCourses = true;
    if(term){
      this.courseService.getCourseBySearchTerm(term!).subscribe((res: any) => {
        this.allCourses = res.data;
        this.filteredCourses = [...this.allCourses];
        this.updatePagedCourses();
        this.loadingCourses = false;
      });
    }
   
  }

  applyFilters(): void {
    let filtered = [...this.allCourses];

    if (this.categoryFilter.value) {
      filtered = filtered.filter(course => course.courseType === this.categoryFilter.value);
    }
    if (this.instructorFilter.value) {
      filtered = filtered.filter(course => course.instructor?.includes(this.instructorFilter.value as string));
    }

    this.filteredCourses = filtered;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagedCourses();
  }

  updatePagedCourses(): void {
    if (this.paginator) {
      this.paginator.length = this.filteredCourses.length;
    }
    this.noCoursesFound = this.filteredCourses.length === 0;
  }

  getPagedCourses(): CourseData[] {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredCourses.slice(startIndex, endIndex);
  }

  handlePageEvent(e: any): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.updatePagedCourses();
  }


}