import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appImagenFallback]',
  standalone: true,
})
export class ImagenFallbackDirective {
  @Input() appImagenFallback: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError() {
    const fallback = this.appImagenFallback ||
      'https://ui-avatars.com/api/?name=U&background=2d141e&color=c9a96e&size=128';
    this.el.nativeElement.src = fallback;
  }
}
