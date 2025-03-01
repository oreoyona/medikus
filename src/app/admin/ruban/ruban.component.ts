import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointService } from '../../common/services/breakpoint-service.service';

@Component({
  selector: 'app-ruban',
  imports: [MatButtonModule, MatIconModule, MatRippleModule],
  templateUrl: './ruban.component.html',
  styleUrl: './ruban.component.scss',
})
export class RubanComponent {
  bp = inject(BreakpointService);
  mobile = this.bp.mobile;
  ruban = this.bp.getDisplayRuban;

  toggleRuban(): void {
    this.bp.toggleRuban();
  }

  constructor() {}
}

