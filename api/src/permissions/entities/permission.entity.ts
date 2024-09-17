import { Role } from 'src/role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Permission {
  kind: 'Permission';

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  action: string;

  @Column()
  subject: string;

  @Column({
    nullable: true,
    type: 'text',
    transformer: {
      to: (value: string[]) => (value ? JSON.stringify(value) : null), // Convert array to JSON string when saving
      from: (value: string) => (value ? JSON.parse(value) : []), // Convert JSON string back to array when retrieving
    },
  })
  fields: string[];

  @Column({
    nullable: true,
    type: 'text',
    transformer: {
      to: (value: Object) => (value ? JSON.stringify(value) : null), // Convert object to JSON string when saving
      from: (value: string) => (value ? JSON.parse(value) : null), // Convert JSON string back to object when retrieving
    },
  })
  conditions: Object;

  @Column({ default: false })
  inverted: boolean;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: 'permission_role',
    joinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
