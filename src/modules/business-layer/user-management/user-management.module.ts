import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';

@Module({
  controllers: [UserManagementController],
  providers: [UserManagementService],
})
export class UserManagementModule {}
