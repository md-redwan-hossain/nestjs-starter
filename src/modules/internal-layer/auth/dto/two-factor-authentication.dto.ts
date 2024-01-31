import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { EmailLoginDto } from "./login.dto";

export class TwoFactorAuthenticationDto extends EmailLoginDto {
  @ApiProperty()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  Token: string;
}

export class TwoFactorAuthenticationWithRecoveryCodeDto extends EmailLoginDto {
  @ApiProperty()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  RecoveryCode: string;
}
