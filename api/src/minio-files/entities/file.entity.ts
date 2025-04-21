// src/minio-files/entities/file.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from 'src/article/entities/article.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  uniqueName: string;

  @Column()
  size: number;

  @Column()
  mimetype: string;

  @Column({ nullable: true })
  thumbnailName: string;

  @Column()
  bucket: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationship with Article (many files can be in many articles)
  @ManyToMany(() => Article, (article) => article.files)
  articles: Article[];
}
