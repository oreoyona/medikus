import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointService } from '../../common/services/breakpoint-service.service';
import { AuthService } from '../../auth/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../common/header/header.component";

@Component({
  selector: 'app-ruban',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeaderComponent
],
  templateUrl: './ruban.component.html',
  styleUrl: './ruban.component.scss',
})
export class RubanComponent {
  bp = inject(BreakpointService);
  as = inject(AuthService)
  mobile = this.bp.mobile;
  ruban = this.bp.getDisplayRuban
  isAuthenticated = this.as.isAuthenticated()

  toggleRuban(): void {
    this.bp.toggleRuban();
  }

  constructor() {}
}

