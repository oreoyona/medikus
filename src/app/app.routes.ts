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
import { EmailVerificationComponent } from './auth/email-verification/email-verification.component';
import { RegistrationSuccessComponent } from './auth/inscription/registration-success.component';
import { ResendEmailComponent } from './auth/resend-email/resend-email-verification.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { AllEventsComponent } from './all-events/all-events.component';
import { EditWebinaireComponent } from './admin/edit-webinaire-component/edit-webinaire-component.component';
import { ShowAllWebinairesComponent } from './admin/show-all-webinaires/show-all-webinaires.component';
import { SettingsComponent } from './settings/settings.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { authGuard, adminGuard } from './admin/admin.guard'; // Assuming you've updated these to function guards
import { maintenanceModeGuard } from './maintenance-mode.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { AllPostsComponent } from './blog/all-posts/all-posts.component';
import { EditPostComponent } from './blog/edit-post/edit-post.component';
import { PostDetailComponent } from './blog/post-detail/post-detail.component';
import { CreatePostComponent } from './blog/create-post/create-post.component';
import { ShowPostByAuthorComponent } from './blog/show-post-by-author/show-post-by-author.component';
import { BlogStatisticsComponent } from './blog-statistics/blog-statistics.component';

export const routes: Routes = [
  //COMMON ROUTES
  { path: 'maintenance', component: MaintenanceComponent, data: { animation: 'MaintenancePage' }  }, // Define your maintenance page route
  { path: '', component: HomeComponent ,data: { animation: 'HomePage' }, canActivate: [maintenanceModeGuard] },
  { path: 'acceuil', redirectTo: '', pathMatch: 'full', data: { animation: 'HomePage' } },
  { path: 'home', redirectTo: '', pathMatch: 'full', data: { animation: 'HomePage' } },
  { path: 'join', redirectTo: '', data: { animation: 'HomePage' } },
  { path: 'learn/:id', component: SingleCoursComponent, canActivate: [maintenanceModeGuard], data: { animation: 'SingleCoursPage' } },
  { path: 'dashboard', component: ProfileComponent, canActivate: [maintenanceModeGuard, authGuard], data: { animation: 'ProfilePage' } },
  { path: 'events', component: AllEventsComponent, canActivate: [maintenanceModeGuard] },
  { path: 'subscribe', redirectTo: '', data: { animation: 'HomePage' } },
  { path: 'blog', component: AllPostsComponent,  data: { animation: 'BlogPage' } },
  { path: 'blog/posts/edit/:id', component: EditPostComponent, data: { animation: 'PostEditPage'}},
  { path: 'progress', component: ProgressComponent, canActivate: [authGuard, maintenanceModeGuard], data: { animation: 'ProgressPage' } },
  { path: 'blog/posts/:slug', component: PostDetailComponent, data: {animation: 'PostDetailPage'}},
  { path: 'blog/author/:name', component: ShowPostByAuthorComponent, data: {animation: 'ShowAuthorPostPage'}},
  { path: 'about', component: AboutComponent, canActivate: [maintenanceModeGuard], data: { animation: 'AboutPage' } },
  { path: 'contact', component: ContactComponent,canActivate: [maintenanceModeGuard], data: { animation: 'ContactPage' } },
  { path: 'catalogue', component: CatalogueComponent,canActivate: [maintenanceModeGuard], data: { animation: 'CataloguePage' } },
  { path: 'auth/login', component: AuthComponent, data: { animation: 'AuthLoginPage' } }, // No need for resolver here, it's the login page
  { path: 'auth/inscription', component: AuthComponent, canActivate: [maintenanceModeGuard], data: { animation: 'AuthInscriptionPage' } },
  { path: 'edit-profile/:id', component: EditProfileComponent, canActivate: [maintenanceModeGuard], data: { animation: 'EditProfilePage' } },
  { path: 'privacy', component: PrivacyPolicyComponent, canActivate: [maintenanceModeGuard], data: {animation: 'PrivacyPolicyPage'}},
  { path: 'terms', component: TermsOfServiceComponent, canActivate: [maintenanceModeGuard], data: {animation: 'TermsOfServicePage'}},
  { path: 'webinaire/:id', component: ShowWebinaireComponent,canActivate: [maintenanceModeGuard], data: {animation: 'ShowWebinairePage'} },
  { path: 'auth/user/reset', component: ForgotPasswordComponent, canActivate: [maintenanceModeGuard],  data: {animation: 'ForgotPasswordPage'} },
  { path: 'auth/verify/:token', component: EmailVerificationComponent, canActivate: [maintenanceModeGuard],  data: {animation: 'EmailVerificationPage'} },
  { path: 'auth/registration-success', component: RegistrationSuccessComponent,canActivate: [maintenanceModeGuard], data: {animation: 'RegistrationSuccessPage'} },
  { path: 'auth/activation', component: ResendEmailComponent }, // No need for resolver here
  { path: 'learn', redirectTo: 'dashboard', pathMatch: "full"},
  { path: 'auth/reset-password/:token', component: ResetPasswordComponent, canActivate: [maintenanceModeGuard] },
  { path: 'learn/webinaires/:id', component: ShowWebinaireComponent, canActivate: [maintenanceModeGuard] },
   

  //LEARN ROUTES
  {
    path: 'learn/cours/:id',
    component: CoursComponent,
    canActivate: [maintenanceModeGuard,authGuard],
    canActivateChild: [authGuard, maintenanceModeGuard],
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
      { path: 'webinaires', component: ShowAllWebinairesComponent, outlet: 'admin',data: {animation: 'WebinairesPage'}},
      { path: 'webinaires/:id', component: EditWebinaireComponent, outlet: 'admin',data: {animation: 'IdWebinairePage'}},
      { path: 'settings', component: SettingsComponent, outlet: 'admin', data: {animation: 'SettingsPage'}},
      { path: 'blog/post/add', component: CreatePostComponent, outlet: 'admin', data: {animation: 'AddPostPage'}},
      { path: 'blog-statistics', component: BlogStatisticsComponent, outlet: 'admin', data: {animation: 'BlogStatsPage'}}

      
    ],
  },


  { path: '**', component: NotFoundComponent , canActivate: [maintenanceModeGuard], data: {animation: 'NoPageFound'} }, // The wildcard route
];