// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { Client } from 'minio';
// import { Readable, Writable } from 'stream';
// import { v4 as uuidv4 } from 'uuid';
// import { FileMeta, UploadService } from './upload-service';

// @Injectable()
// export class MinioUploadService implements UploadService, OnModuleInit {
//   static bucketName = 'all';
//   private static _minioClient: Client;
//   static get minioClient(): Client {
//     return this._minioClient;
//   }
//   constructor() {
//     MinioUploadService._minioClient = new Client({
//       endPoint: 'minio',
//       port: 9000,
//       useSSL: false,
//       accessKey: 'minioadmin',
//       secretKey: 'minioadmin',
//     });
//   }

//   async createDirectory(bucketName: string): Promise<void> {
//     const list = await MinioUploadService.minioClient.listBuckets();
//     if (!list.map((bucket) => bucket.name).includes(bucketName)) {
//       MinioUploadService.minioClient.makeBucket(
//         bucketName,
//         'us-east-1',
//         (err) => {
//           if (err) return console.log('Error creating bucket.', err);
//           const policyStatement = {
//             Version: '2012-10-17',
//             Statement: [
//               {
//                 Sid: 'PublicReadGetObject',
//                 Effect: 'Allow',
//                 Principal: '*',
//                 Action: ['s3:GetObject'],
//                 Resource: [`arn:aws:s3:::${bucketName}/*`],
//               },
//             ],
//           };
//           MinioUploadService.minioClient.setBucketPolicy(
//             bucketName,
//             JSON.stringify(policyStatement),
//             (err) => {
//               if (err) {
//                 return console.log(
//                   `Error setting policy for bucket ${bucketName}: `,
//                   err,
//                 );
//               }
//             },
//           );
//         },
//       );
//     }
//   }

//   provide(meta: FileMeta) {
//     return new Promise((resolve) => {
//       const objName = uuidv4();
//       MinioUploadService.minioClient.putObject(
//         MinioUploadService.bucketName,
//         objName,
//         meta.file,
//         {
//           'Content-Type': meta.mimetype,
//         },
//         // (err, etag) => {
//         //   if (err) {
//         //     reject(err);
//         //   }
//         //   resolve({
//         //     ...etag,
//         //     encoding: meta.encoding,
//         //     mimeType: meta.mimetype,
//         //     filename: objName,
//         //     orginalFileName: meta.filename,
//         //   });
//         // },
//       );
//       resolve({
//         encoding: meta.encoding,
//         mimeType: meta.mimetype,
//         filename: objName,
//         orginalFileName: meta.filename,
//       });
//     });
//   }

//   async getStreamFile(filename: string): Promise<Readable> {
//     return new Promise<Readable>((resolve, reject) => {
//       MinioUploadService.minioClient.getObject(
//         MinioUploadService.bucketName,
//         filename,
//         (err, stream) => {
//           if (err) {
//             reject(err);
//           }
//           resolve(stream);
//         },
//       );
//     });
//   }

//   async getFile(filename: string): Promise<Buffer> {
//     const buffer = [];
//     const streamable = await this.getStreamFile(filename);

//     streamable.on('data', (chk) => {
//       buffer.push(chk);
//     });

//     return new Promise<Buffer>((resolve) => {
//       streamable.on('end', () => {
//         resolve(Buffer.concat(buffer));
//       });
//     });
//   }
//   async getWritableStream(
//     bucketName: string,
//     fileName: string,
//   ): Promise<Writable> {
//     const writableStream = new Writable({
//       write: (chunk, encoding, callback) => {
//         MinioUploadService.minioClient.putObject(
//           bucketName,
//           fileName,
//           chunk,
//           (err, etag) => {
//             console.log(etag);
//             if (err) {
//               console.log(err);
//               callback(err);
//             } else {
//               callback();
//             }
//           },
//         );
//       },
//     });

//     return Promise.resolve(writableStream);
//   }

//   async onModuleInit() {
//     this.createDirectory(MinioUploadService.bucketName);
//   }

//   static async deleteFileFromMinio(filename: string) {
//     return await new Promise((resolve, reject) => {
//       MinioUploadService.minioClient.removeObject(
//         MinioUploadService.bucketName,
//         filename,
//         (err) => {
//           if (err) {
//             reject(err);
//           }
//           resolve(null);
//         },
//       );
//     });
//   }
// }
