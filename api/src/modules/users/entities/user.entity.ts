import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Article } from 'src/modules/articles/entities/article.entity';
import { Role } from 'src/role/entities/role.entity';

@Entity('users')
@Expose()
export class User {
  kind: 'User';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @OneToMany(() => Article, (article) => article.author, { cascade: true })
  articles: Article[];

  @ManyToMany(() => Role, (role) => role.users, { cascade: true, eager: true })
  roles: Role[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
