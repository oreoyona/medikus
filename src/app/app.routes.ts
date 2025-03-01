import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SingleCoursComponent } from './single-cours/single-cours.component';
import { ProgressComponent } from './progress/progress.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { ProfileComponent } from './profile/profile.component';
import { CoursComponent } from './cours/cours.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { AuthComponent } from './auth/auth.component';
import { CreateCourseComponent } from './admin/create-course/create-course.component';
import { SocialComponent } from './common/social/social.component';
import { EditCourseComponent } from './admin/edit-course/edit-course.component';
import { DeleteDialogComponent } from './admin/edit-course/delete-dialog.component';
import { adminGuard, authGuard } from './admin/admin.guard';
import { CreateUserComponent } from './admin/create-user/create-user.component';
import { UsersComponent } from './admin/users/users.component';
import { RubanComponent } from './admin/ruban/ruban.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'acceuil', redirectTo: '', pathMatch: 'full' },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'join', redirectTo: '' },
    { path: 'learn/:id', component: SingleCoursComponent },
    { path: 'dashboard', component: ProfileComponent, canActivate: [authGuard] },
    { path: 'learn/cours/:id', component: CoursComponent, canActivate: [authGuard] },
    { path: 'events', redirectTo: '' },
    { path: 'subscribe', redirectTo: '' },
    { path: 'blog', redirectTo: '' },
    { path: 'progress', component: ProgressComponent, canActivate: [authGuard] },
    { path: 'about', component: AboutComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'catalogue', component: CatalogueComponent},
    { path: 'auth/login', component: AuthComponent},
    { path: 'auth/inscription', component: AuthComponent},
    { path: 'courses/add', component: CreateCourseComponent, canActivate: [adminGuard]},
    { path: 'test', component: SocialComponent },
    { path: 'courses/:id', component: EditCourseComponent,canActivate: [adminGuard]},
    { path: 'admin/create_user', component: CreateUserComponent,},
    { path: 'admin/users', component: UsersComponent,canActivate: [authGuard]},
    { path: 'ruban', component: RubanComponent}
];
