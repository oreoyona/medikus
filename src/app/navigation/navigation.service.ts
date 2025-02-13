import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private  breakPoint760 = "760px";
  private breakPoint600 = "600px";
  private breakPoint560 = "560px"
  private breakpointObserver = inject(BreakpointObserver);

  isSmall$: Observable<boolean> = this.breakpointObserver.observe(this.breakPoint560)
    .pipe(
      map((result) => {return result.matches}),
      shareReplay()
    );



  constructor() { }
}
