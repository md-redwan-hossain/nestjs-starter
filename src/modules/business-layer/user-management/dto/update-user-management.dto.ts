import { PartialType } from '@nestjs/swagger';
import { CreateUserManagementDto } from './create-user-management.dto';

export class UpdateUserManagementDto extends PartialType(CreateUserManagementDto) {}
