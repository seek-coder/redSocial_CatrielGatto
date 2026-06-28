import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizarRol',
  standalone: true,
})
export class CapitalizarRolPipe implements PipeTransform {
  transform(valor: string): string {
    if (!valor) return '';
    return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
  }
}
