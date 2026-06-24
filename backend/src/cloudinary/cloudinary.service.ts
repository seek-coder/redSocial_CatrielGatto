import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async subirImagen(archivo: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'red-social-dionisos' },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (result) {
            resolve(result.secure_url);
          } else {
            reject(error);
          }
        },
      );
      uploadStream.end(archivo.buffer);
    });
  }
}
