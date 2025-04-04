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
import { EditCourseComponent } from './admin/edit-course/edit-course.component';
import { adminGuard, authGuard } from './admin/admin.guard';
import { CreateUserComponent } from './admin/create-user/create-user.component';
import { UsersComponent } from './admin/users/users.component';
import { RubanComponent } from './admin/ruban/ruban.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { AllCoursesComponent } from './admin/all-courses/all-courses.component';
import { EditUserComponent } from './admin/edit-user/edit-user.component';
import { ModuleContentComponent } from './cours/module-content/module-content.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { CreateWebinaireComponent } from './admin/create-webinaire/create-webinaire.component';
import { ShowWebinaireComponent } from './show-webinaire/show-webinaire.component';
import { ForgotPasswordComponent } from './auth/forgot-pwd.component';
import { animation } from '@angular/animations';
import { EmailVerificationComponent } from './auth/email-verification/email-verification.component';
import { RegistrationSuccessComponent } from './auth/inscription/registration-success.component';
import { ResendEmailComponent } from './auth/resend-email/resend-email-verification.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
  //COMMON ROUTES
  { path: '', component: HomeComponent, data: { animation: 'HomePage' } },
  { path: 'acceuil', redirectTo: '', pathMatch: 'full', data: { animation: 'HomePage' } },
  { path: 'home', redirectTo: '', pathMatch: 'full', data: { animation: 'HomePage' } },
  { path: 'join', redirectTo: '', data: { animation: 'HomePage' } },
  { path: 'learn/:id', component: SingleCoursComponent, data: { animation: 'SingleCoursPage' } },
  { path: 'dashboard', component: ProfileComponent, canActivate: [authGuard], data: { animation: 'ProfilePage' } },
  { path: 'events', redirectTo: '', data: { animation: 'HomePage' } },
  { path: 'subscribe', redirectTo: '', data: { animation: 'HomePage' } },
  { path: 'blog', redirectTo: '', data: { animation: 'HomePage' } },
  { path: 'progress', component: ProgressComponent, canActivate: [authGuard], data: { animation: 'ProgressPage' } },
  { path: 'about', component: AboutComponent, data: { animation: 'AboutPage' } },
  { path: 'contact', component: ContactComponent, data: { animation: 'ContactPage' } },
  { path: 'catalogue', component: CatalogueComponent, data: { animation: 'CataloguePage' } },
  { path: 'auth/login', component: AuthComponent, data: { animation: 'AuthLoginPage' } },
  { path: 'auth/inscription', component: AuthComponent, data: { animation: 'AuthInscriptionPage' } },
  { path: 'edit-profile/:id', component: EditProfileComponent, data: { animation: 'EditProfilePage' } },
  { path: 'privacy', component: PrivacyPolicyComponent, data: {animation: 'PrivacyPolicyPage'} },
  { path: 'terms', component: TermsOfServiceComponent, data: {animation: 'TermsOfServicePage'}},
  { path: 'webinaire/:id', component: ShowWebinaireComponent, data: {animation: 'ShowWebinairePage'}},
  { path: 'auth/user/reset', component: ForgotPasswordComponent, data: {animation: 'ForgotPasswordPage'}},
  { path: 'auth/verify/:token', component: EmailVerificationComponent, data: {animation: 'EmailVerificationPage'}},
  { path: 'auth/registration-success', component: RegistrationSuccessComponent, data: {animation: 'RegistrationSuccessPage'}},
  { path: 'auth/activation', component: ResendEmailComponent, },
  { path: 'learn', redirectTo: 'catalogue', pathMatch: "full"},
  { path: 'auth/reset-password/:token', component: ResetPasswordComponent},
  //LEARN ROUTES
  {
    path: 'learn/cours/:id',
    component: CoursComponent,
    canActivate: [authGuard],
    data: { animation: 'CoursPage' },
    children: [
      { path: ':module', component: ModuleContentComponent, outlet: 'module', data: { animation: 'ModuleContentPage' } },
    ],
  },

  //ADMIN ROUTES
  {
    path: 'admin',
    component: RubanComponent,
    canActivate: [adminGuard],
    data: { animation: 'AdminRootPage' },
    children: [
      { path: '', component: AdminDashboardComponent, outlet: 'admin', data: { animation: 'AdminDashboardPage' } },
      { path: 'users/:id', component: EditUserComponent, outlet: 'admin', data: { animation: 'EditUserPage' } },
      { path: 'users/add', component: CreateUserComponent, outlet: 'admin', data: { animation: 'CreateUserPage' } },
      { path: 'users', component: UsersComponent, outlet: 'admin', data: { animation: 'UsersPage' } },
      { path: 'courses/add', component: CreateCourseComponent, outlet: 'admin', data: { animation: 'CreateCoursePage' } },
      { path: 'courses/:id', component: EditCourseComponent, outlet: 'admin', data: { animation: 'EditCoursePage' } },
      { path: 'courses', component: AllCoursesComponent, outlet: 'admin', data: { animation: 'AllCoursesPage' } },
      { path: 'webinaire/add',  component: CreateWebinaireComponent, outlet: 'admin', data: {animation: 'AddWebinairePage'}},
    ],
  },
];