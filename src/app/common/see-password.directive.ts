import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[showPwd]'
})
export class SeePasswordDirective {


  @Input() showPwd: boolean = false;

  constructor(private el: ElementRef) {}

  @HostListener('click')
  togglePassword() {
    const input: HTMLInputElement = this.el.nativeElement.previousElementSibling;
    if (input) {
      
      this.showPwd = !this.showPwd;
      input.type = this.showPwd ? 'text' : 'password';
    }
  }
}
