import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { Publicacion, PublicacionSchema } from './publicacion.schema';
import { EstadisticasController } from './estadisticas.controller';
import { Comentario, ComentarioSchema } from '../comentarios/comentario.schema';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    AutenticacionModule,
  ],
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}
