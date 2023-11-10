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

export class EmailLoginDto {
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
}

export class MobileNumberLoginDto {
  @ApiProperty({
    description: "BD mobile number with country code +88",
    example: "+8801636578031"
  })
  @IsMobilePhone("bn-BD", { strictMode: true })
  @Length(14, 14)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  MobileNumber: string;

  @ApiProperty()
  @IsStrongPassword({ minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  @Length(8, 128)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  Password: string;
}
