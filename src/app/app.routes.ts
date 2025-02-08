import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SingleCoursComponent } from './single-cours/single-cours.component';
import { ProgressComponent } from './progress/progress.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'acceuil',
        redirectTo: '', pathMatch: 'full'
    },
    {
        path: 'home',
        redirectTo: '', pathMatch: 'full'
    },
    {
        path: 'join',
        redirectTo: ''
    },
    {
        path: 'learn/:id',
        component: SingleCoursComponent
    },

    {
        path: 'learn',
        redirectTo: ''
    },
    {
        path: 'events',
        redirectTo: ''
    }
    ,
    {
        path: 'subscribe',
        redirectTo: ''
    }
    ,
    {
        path: 'blog',
        redirectTo: ''
    },
    {
        path: 'progress',
        component: ProgressComponent
    }
];
