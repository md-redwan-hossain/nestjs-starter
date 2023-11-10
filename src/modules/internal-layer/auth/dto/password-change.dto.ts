import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length
} from "class-validator";

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(8, 128)
  @IsStrongPassword({ minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  OldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(8, 128)
  @IsStrongPassword({ minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  NewPassword: string;
}
