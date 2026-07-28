import { Module } from '@nestjs/common';
import { ParentModule } from '../parent/parent.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [ParentModule],
  controllers: [AuthController],
})
export class AuthModule {}
