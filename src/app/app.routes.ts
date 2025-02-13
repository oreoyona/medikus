import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SingleCoursComponent } from './single-cours/single-cours.component';
import { ProgressComponent } from './progress/progress.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { ProfileComponent } from './profile/profile.component';
import { CoursComponent } from './cours/cours.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'acceuil', redirectTo: '', pathMatch: 'full' },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'join', redirectTo: '' },
    { path: 'learn/:id', component: SingleCoursComponent },
    { path: 'learn', component: ProfileComponent },
    { path: 'learn/cours/:id', component: CoursComponent },
    { path: 'events', redirectTo: '' },
    { path: 'subscribe', redirectTo: '' },
    { path: 'blog', redirectTo: '' },
    { path: 'progress', component: ProgressComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contact', component: ContactComponent }
];
