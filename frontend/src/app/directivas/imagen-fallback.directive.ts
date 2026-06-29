import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appImagenFallback]',
  standalone: true,
})
export class ImagenFallbackDirective implements OnInit {
  @Input() appImagenFallback: string = '';

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    // Si la imagen arranca vacía, aplicamos el fallback directo sin esperar al error
    if (!this.el.nativeElement.getAttribute('src') || this.el.nativeElement.getAttribute('src') === '') {
      this.aplicarFallback();
    }
  }

  @HostListener('error')
  onError() {
    this.aplicarFallback();
  }

  private aplicarFallback() {
    const fallback = this.appImagenFallback ||
      'https://ui-avatars.com/api/?name=U&background=2d141e&color=c9a96e&size=128';
    this.el.nativeElement.src = fallback;
  }
}
