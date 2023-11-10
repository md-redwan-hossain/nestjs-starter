import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ChangePasswordDto } from "../../modules/internal-layer/auth/dto/password-change.dto";

@Injectable()
export class DisallowSameOldAndNewPasswordPipe implements PipeTransform {
  transform(value: ChangePasswordDto) {
    if (value.OldPassword === value.NewPassword) {
      throw new BadRequestException("OldPassword and NewPassword cannot be same");
    }
    return value;
  }
}
