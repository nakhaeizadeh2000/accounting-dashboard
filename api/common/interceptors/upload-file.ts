// import {
//   CallHandler,
//   ExecutionContext,
//   Inject,
//   Injectable,
//   NestInterceptor,
// } from '@nestjs/common';
// import { catchError, Observable } from 'rxjs';
// import { FastifyRequest } from 'fastify';
// import * as Busboy from 'busboy';

// import { UploadService, UPLOAD_SERVICE } from 'utils/services/upload-service';
// import { formDataToObject } from 'utils/functions/formdata-to-object';
// import { MinioUploadService } from 'utils/services/minio-upload-service';

// @Injectable()
// export class FileUploadInterceptor implements NestInterceptor {
//   constructor(@Inject(UPLOAD_SERVICE) private uploadService: UploadService) {}
//   async intercept(
//     context: ExecutionContext,
//     next: CallHandler<any>,
//   ): Promise<Observable<any>> {
//     const req: FastifyRequest = context.switchToHttp().getRequest();
//     if (!req.isMultipart()) {
//       return next.handle();
//     }
//     const busboy = Busboy({
//       headers: req.headers,
//     });
//     const fieldList: { [key: string]: any } = {};
//     const files: Promise<any>[] = [];
//     busboy.on('field', (name, value) => {
//       fieldList[name] = value;
//     });
//     busboy.on('file', (fieldname, file, info) => {
//       const { filename, encoding, mimeType } = info;

//       files.push(
//         this.uploadService
//           .provide({
//             fieldname: fieldname,
//             file: file,
//             filename: filename,
//             encoding: encoding,
//             mimetype: mimeType,
//           })
//           .then((value) => {
//             fieldList[fieldname] = value;
//             return value;
//           }),
//       );
//     });
//     const filesMeta: any[] = await new Promise((resovle) => {
//       busboy.on('finish', () => {
//         Promise.all(files).then((data) => {
//           resovle(data);
//         });
//       });
//       req.raw.pipe(busboy);
//     });

//     req.body = formDataToObject(fieldList);
//     // continue
//     // req.file()
//     // req.pipe(busboy);
//     return next.handle().pipe(
//       catchError(async (error) => {
//         const deleteList = filesMeta.map((fileMeta) => {
//           return MinioUploadService.deleteFileFromMinio(fileMeta.filename);
//         });

//         await Promise.all(deleteList);
//         throw error;
//       }),
//     );
//   }
// }
