import { Writable } from 'stream';

export interface FileMeta {
  fieldname: string;
  file: any;
  filename: any;
  encoding: string;
  mimetype: string;
}

export interface UploadService {
  provide(file: FileMeta): Promise<any>;
  createDirectory(names: string): Promise<void>;
  getStreamFile(filename: string);
  getFile(filename: string): Promise<Buffer>;
  getWritableStream(fileBuffer, bucketName: string): Promise<Writable>;
}

export const UPLOAD_SERVICE = 'UPLOAD_SERVICE';
