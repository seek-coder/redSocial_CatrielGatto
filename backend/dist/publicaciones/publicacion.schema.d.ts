import { Document, Types } from 'mongoose';
export type PublicacionDocument = Publicacion & Document;
export declare class Publicacion {
    titulo: string;
    mensaje: string;
    imagen: string;
    autor: Types.ObjectId;
    likes: Types.ObjectId[];
    activa: boolean;
}
export declare const PublicacionSchema: import("mongoose").Schema<Publicacion, import("mongoose").Model<Publicacion, any, any, any, any, any, Publicacion>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Publicacion, Document<unknown, {}, Publicacion, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Publicacion & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    titulo?: import("mongoose").SchemaDefinitionProperty<string, Publicacion, Document<unknown, {}, Publicacion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mensaje?: import("mongoose").SchemaDefinitionProperty<string, Publicacion, Document<unknown, {}, Publicacion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    imagen?: import("mongoose").SchemaDefinitionProperty<string, Publicacion, Document<unknown, {}, Publicacion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    autor?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Publicacion, Document<unknown, {}, Publicacion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    likes?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Publicacion, Document<unknown, {}, Publicacion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    activa?: import("mongoose").SchemaDefinitionProperty<boolean, Publicacion, Document<unknown, {}, Publicacion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Publicacion>;
