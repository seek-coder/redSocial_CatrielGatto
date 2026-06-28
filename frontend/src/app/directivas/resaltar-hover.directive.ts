import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appResaltarHover]',
  standalone: true,
})
export class ResaltarHoverDirective {
  @Input() appResaltarHover: string = '#c9a96e';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.borderColor = this.appResaltarHover;
    this.el.nativeElement.style.boxShadow = `0 0 12px ${this.appResaltarHover}40`;
    this.el.nativeElement.style.transition = 'border-color 0.3s, box-shadow 0.3s';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.borderColor = '';
    this.el.nativeElement.style.boxShadow = '';
  }
}
