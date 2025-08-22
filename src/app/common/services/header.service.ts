import { ChangeDetectorRef, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { BreakpointService } from './breakpoint-service.service';


export const xSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1227" viewBox="0 0 1200 1227" fill="none">
<path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="white"/>
</svg>`;
export const bPoint760px = "(max-width: 760px)";
@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  authService = inject(AuthService)
  router = inject(Router)
  route = inject(ActivatedRoute)
  bs = inject(BreakpointService)
  navigation = [
    {
      titre: 'Acceuil',
      link: "home"
    },

    {
      titre: 'A Propos',
      link: 'about'
    },

    {
      titre: 'Contact',
      link: 'contact'
    },

    {
      titre: 'Blog',
      link: 'blog'
    }



  ]
  currentTheme = signal("light");
  private mediaQueryList: MediaQueryList | null = null;


  /** returns true if the current route is set to home */
  private isHomeActivated() {
    return this.router.routerState.snapshot.url == "/" || this.router.routerState.snapshot.url == "/home"
  }

  /** Signal bool that returns true if the current screen size is considered mobile */
  isMobile = this.bs.mobile()

  checkTheNav(authService: AuthService) {
    this.isHomeActivated()
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();
    const isEditor = authService.isEditor();

    // Start with a new, empty navigation array
    this.navigation = [];

    // Add static navigation items
    this.navigation.push({ titre: 'Accueil', link: 'home' });
    this.navigation.push({ titre: 'A Propos', link: 'about' })
    this.navigation.push({ titre: 'Blog', link: 'blog' });
    this.navigation.push({ titre: 'Contact', link: 'contact' })

    // Add dynamic navigation items based on user roles and state
    if (isAdmin) {
      this.navigation.push({ titre: 'Tableau de bord', link: 'admin' });
    } else if (isEditor) {
      this.navigation.push({ titre: 'Édition', link: 'edition' });
    } else if (isAuthenticated && !this.isHomeActivated() && !this.isMobile) {
      this.navigation.push({ titre: 'Apprendre', link: 'dashboard' });
    }

    // Add the final item based on authentication status
    const authItem = isAuthenticated
      ? { titre: 'Déconnexion', link: 'logout' }
      : { titre: 'Connexion', link: 'auth/login' };

    this.navigation.push(authItem);
  }



  detectTheme() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.currentTheme.set('dark');
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      this.currentTheme.set('light');
    } else {
      this.currentTheme.set('light'); // Default to light if no preference is expressed
    }
  }


  listenThemeDection(cdr: ChangeDetectorRef) {
    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    if (this.mediaQueryList) {
      this.mediaQueryList.addEventListener('change', () => { this.detectTheme(); cdr.markForCheck() });
    }
  }

  constructor() {

  }

}
