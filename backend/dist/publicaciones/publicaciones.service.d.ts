import { Model } from 'mongoose';
import { PublicacionDocument } from './publicacion.schema';
export declare class PublicacionesService {
    private publicacionModel;
    constructor(publicacionModel: Model<PublicacionDocument>);
}
