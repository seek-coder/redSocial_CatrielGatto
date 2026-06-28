import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaRelativa',
  standalone: true,
})
export class FechaRelativaPipe implements PipeTransform {
  transform(valor: string): string {
    if (!valor) return '';

    const fecha = new Date(valor);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const semanas = Math.floor(dias / 7);
    const meses = Math.floor(dias / 30);

    if (segundos < 60) return 'hace un momento';
    if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    if (dias < 7) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    if (semanas < 4) return `hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
    if (meses < 12) return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;

    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
