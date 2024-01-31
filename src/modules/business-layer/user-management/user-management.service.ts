import { Injectable } from '@nestjs/common';
import { CreateUserManagementDto } from './dto/create-user-management.dto';
import { UpdateUserManagementDto } from './dto/update-user-management.dto';

@Injectable()
export class UserManagementService {
  create(createUserManagementDto: CreateUserManagementDto) {
    return 'This action adds a new userManagement';
  }

  findAll() {
    return `This action returns all userManagement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userManagement`;
  }

  update(id: number, updateUserManagementDto: UpdateUserManagementDto) {
    return `This action updates a #${id} userManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} userManagement`;
  }
}
