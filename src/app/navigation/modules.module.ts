import { NgModule } from '@angular/core';

import { CommonModule, NgClass } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule, MatNavList } from '@angular/material/list';

import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ecgCours } from '../common/infercaces';

@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatTabsModule,
    NgClass,
    CommonModule,
    MatListModule,
    MatTabsModule
    
  ]
})
export class ModulesModule { }
