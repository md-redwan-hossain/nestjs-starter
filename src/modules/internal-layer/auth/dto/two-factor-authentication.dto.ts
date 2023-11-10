import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsStrongPassword,
  Length
} from "class-validator";

export class TwoFactorAuthenticationDto {
  @ApiProperty()
  @IsEmail()
  @Length(4, 256)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  Email: string;

  @ApiProperty()
  @IsStrongPassword({ minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  @Length(8, 128)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  Password: string;

  @ApiProperty()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  Token: string;
}

export class TwoFactorAuthenticationWithRecoveryCodeDto {
  @ApiProperty()
  @IsEmail()
  @Length(4, 256)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  Email: string;

  @ApiProperty()
  @IsStrongPassword({ minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  @Length(8, 128)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  Password: string;

  @ApiProperty()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  RecoveryCode: string;
}
