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
import { HttpClient } from '@angular/common/http';
import { CatalogueService } from './catalogue.service';

@Component({
  selector: 'app-catalogue',
  imports: [HeaderComponent, MatDividerModule, FooterComponent, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, FormsModule, MatButtonModule],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss'
})
export class CatalogueComponent implements OnInit{

  catalogueService = inject(CatalogueService);
  
  ngOnInit(): void {
    
    this.catalogueService.getTheUsers().subscribe((e)=>{console.log(e)})

  }

  searchValue = new FormControl("");

  search(){

  }

}
