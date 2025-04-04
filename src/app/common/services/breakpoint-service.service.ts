import { computed, Injectable, signal } from '@angular/core';
import { rubanObject } from '../infercaces';



@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  private breakpoints = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
  };

  ruban: rubanObject[] = [
    { icon: 'home', title: 'Acceuil', link: '/admin/' },
    { icon: 'person', title: 'Utilisateurs', link: [{ outlets: { admin: ['users'] } }] }, 
    { icon: 'description', title: 'Cours', link: [{ outlets: { admin: ['courses'] } }] }, 
    { icon: 'edit_document', title: 'Créer un cours', link: [{ outlets: { admin: ['courses', 'add'] } }] }, 
    { icon: 'movie', title: 'Créer un webinaire', link: [{ outlets: { admin: ['webinaire', 'add'] } }]},
    { icon: 'skip_previous', title: 'Cacher le menu' },
    { icon: 'skip_next', title: 'Montrer le menu' },
];

  mobile = computed(() => this.isBreakpoint('xs'));
  currentBreakpoint = signal<string>('xs');

  filteredRuban = computed(() => {
    if (this.mobile()) {
      return this.ruban.filter(item => item.icon !== 'skip_previous' && item.icon !== 'skip_next');
    } else {
      return this.ruban;
    }
  });

  rubanExpanded = signal<boolean>(true); // Initial state: expanded

  toggleRuban(): void {
    this.rubanExpanded.update(value => !value);
  }

  getRuban(): rubanObject[] {
    if (this.mobile()) {
      return this.filteredRuban();
    }
    return this.ruban;
  }

  getDisplayRuban = computed(() =>{
      if(this.mobile()){
          return this.filteredRuban();
      }
      if(this.rubanExpanded()){
          return this.ruban.filter(item => item.icon !== 'skip_next');
      }
      return this.ruban.filter(item => item.icon !== 'skip_previous');
  })


  constructor() {
    this.updateBreakpoint();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize = (): void => {
    this.updateBreakpoint();
  };

  private updateBreakpoint(): void {
    const width = window.innerWidth;
    let newBreakpoint = 'xs';

    if (width >= this.breakpoints.xxl) {
      newBreakpoint = 'xxl';
    } else if (width >= this.breakpoints.xl) {
      newBreakpoint = 'xl';
    } else if (width >= this.breakpoints.lg) {
      newBreakpoint = 'lg';
    } else if (width >= this.breakpoints.md) {
      newBreakpoint = 'md';
    } else if (width >= this.breakpoints.sm) {
      newBreakpoint = 'sm';
    }

    this.currentBreakpoint.set(newBreakpoint);
  }

  isBreakpoint(breakpoint: string): boolean {
    return this.currentBreakpoint() === breakpoint;
  }

  isGreaterThan(breakpoint: string): boolean {
    const current = this.getBreakpointIndex(this.currentBreakpoint());
    const target = this.getBreakpointIndex(breakpoint);
    return current > target;
  }

  isLessThan(breakpoint: string): boolean {
    const current = this.getBreakpointIndex(this.currentBreakpoint());
    const target = this.getBreakpointIndex(breakpoint);
    return current < target;
  }

  private getBreakpointIndex(breakpoint: string): number {
    const keys = Object.keys(this.breakpoints);
    return keys.indexOf(breakpoint);
  }
}