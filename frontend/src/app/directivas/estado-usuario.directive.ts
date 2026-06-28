import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appEstadoUsuario]',
  standalone: true,
})
export class EstadoUsuarioDirective implements OnChanges {
  @Input() appEstadoUsuario: boolean = true;

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    if (this.appEstadoUsuario) {
      this.el.nativeElement.style.color = '#8a9a5b';
    } else {
      this.el.nativeElement.style.color = '#c45c6a';
    }
  }
}
