import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appResaltarHover]',
  standalone: true,
})
export class ResaltarHoverDirective {
  @Input() appResaltarHover: string = '';

  private get color(): string {
    return this.appResaltarHover || '#c9a96e';
  }

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.borderColor = this.color;
    // Sombra base + glow sólido (sin canal alfa para máxima compatibilidad)
    this.el.nativeElement.style.boxShadow = `0 8px 32px rgba(0,0,0,0.6), 0 0 15px ${this.color}`;
    this.el.nativeElement.style.transform = 'translateY(-2px)';
    this.el.nativeElement.style.transition = 'all 0.3s ease';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.borderColor = '';
    this.el.nativeElement.style.boxShadow = '';
    this.el.nativeElement.style.transform = '';
  }
}
