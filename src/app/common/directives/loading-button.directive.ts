import { Directive, ElementRef, Renderer2, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Directive({
  selector: '[appLoadingButton]'
})
export class LoadingButtonDirective implements OnChanges {
  @Input() appLoadingButton: boolean = false;
  private originalContent!: string // Store the original content as string
  private spinnerElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
   

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appLoadingButton']) {
      if (this.appLoadingButton) {
        // Store the original content
        this.originalContent = this.el.nativeElement.innerText || this.el.nativeElement.textContent || '';
        console.log(this.originalContent)

        // Disable the button and clear its content
        this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
        this.renderer.setProperty(this.el.nativeElement, 'innerHTML', ''); // Clear content
        this.createSpinner();
      } else {
        // Restore the original content and enable the button
        this.renderer.setProperty(this.el.nativeElement, 'disabled', false);
        // this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.originalContent || ''); // Restore content
        this.removeSpinner();
      }
    }
  }

  private createSpinner() {
    this.spinnerElement = this.renderer.createElement('span');
    this.renderer.addClass(this.spinnerElement, 'spinner-border');
    this.renderer.addClass(this.spinnerElement, 'spinner-border-sm');
    this.renderer.addClass(this.spinnerElement, 'me-2');
    this.renderer.setAttribute(this.spinnerElement, 'role', 'status');
    this.renderer.setAttribute(this.spinnerElement, 'aria-hidden', 'true');
    this.renderer.appendChild(this.el.nativeElement, this.spinnerElement);
  }

  private removeSpinner() {
    if (this.spinnerElement) {
      this.renderer.removeChild(this.el.nativeElement, this.spinnerElement);
      this.spinnerElement = null; // Reset to null after removal
    }
  }
}