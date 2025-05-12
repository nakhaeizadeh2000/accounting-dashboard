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

  @Column({ unique: true })
  uniqueName: string;

  @Column({ nullable: true })
  size: number;

  @Column({ nullable: true })
  mimetype: string;

  @Column({ nullable: true })
  thumbnailName: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 'default' })
  bucket: string;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Use onDelete: 'CASCADE' for the ManyToMany relationship
  @ManyToMany(() => Article, (article) => article.files, {
    onDelete: 'CASCADE'
  })
  articles: Article[];

  // Add other entity relationships here with onDelete: 'CASCADE'
  // For example:
  // @ManyToMany(() => OtherEntity, (otherEntity) => otherEntity.files, {
  //   onDelete: 'CASCADE'
  // })
  // otherEntities: OtherEntity[];
}
