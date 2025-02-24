import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../common/header/header.component";
import {MatDividerModule} from '@angular/material/divider';
import { FooterComponent } from "../common/footer/footer.component";
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CatalogueService } from './catalogue.service';
import { CourseService } from '../admin/course.service';

@Component({
  selector: 'app-catalogue',
  imports: [HeaderComponent, MatDividerModule, FooterComponent, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, FormsModule, MatButtonModule],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss'
})
export class CatalogueComponent implements OnInit{

  catalogueService = inject(CatalogueService);
  courseService = inject(CourseService);
  allCourses = []
  
  ngOnInit(): void {
    this.courseService.getCourses().subscribe((res:any)=>{
      this.allCourses = res.data
      console.log(this.allCourses)
    })
    
  }

  searchValue = new FormControl("");

  search(){
    let searchTerm = this.searchValue.valid ? this.searchValue.value: null;
    this.catalogueService.search(searchTerm!).subscribe((res) => {
    
      this.catalogueService.search(searchTerm!).subscribe((e) => {
       //DO SOMETHING WITH THE RESULT
        console.log(e)
      })
    


    })

  }

}
