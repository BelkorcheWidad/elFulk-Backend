import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { uuidv7 } from 'uuidv7';
import { User } from '../../../typeorm/entities/User';

@Entity()
export class Parent {
  @ApiProperty({ format: 'uuid' })
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  ensureId() {
    this.id ??= uuidv7();
  }

  @ApiProperty({ description: 'Better Auth user ID' })
  @Column({ unique: true, name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiPropertyOptional()
  @Column({ nullable: true, select: false })
  pin_hash: string | null;

  @ApiProperty({ default: false })
  @Column({ default: false })
  pin_activated: boolean;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  phone_number: string | null;

  @ApiProperty({ default: false })
  @Column({ default: false })
  lock_alerts: boolean;

  @ApiProperty({ default: false })
  @Column({ default: false })
  limit_warning: boolean;

  @ApiProperty({ default: true })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
