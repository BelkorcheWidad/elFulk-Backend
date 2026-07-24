import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from './parent.entity';
import { Admin } from '../admin/admin.entity';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { User } from '../../../typeorm/entities/User';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, Admin, User])],
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule {}
