import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from './parent.entity';
import { ParentService } from './parent.service';
import { User } from '../../../typeorm/entities/User';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, User])],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule {}
