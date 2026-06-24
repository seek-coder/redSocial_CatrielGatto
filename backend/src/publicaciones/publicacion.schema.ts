import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicacionDocument = Publicacion & Document;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, maxlength: 100 })
  titulo: string;

  @Prop({ required: true, maxlength: 500 })
  mensaje: string;

  @Prop({ default: '' })
  imagen: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ default: true })
  activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
