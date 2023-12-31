import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length
} from "class-validator";
import { GENDER } from "../../../../shared/enums/gender.enum";

export class CreateStuffDto {
  @ApiProperty()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  FullName: string;

  @ApiProperty()
  @IsEmail()
  @Length(4, 256)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  Email: string;

  @ApiPropertyOptional({
    description: "BD mobile number with country code +88",
    example: "+8801636578031"
  })
  @IsMobilePhone("bn-BD", { strictMode: true })
  @Length(14, 14)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  MobileNumber?: string;

  @ApiProperty()
  @IsStrongPassword({ minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  @Length(8, 128)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  Password: string;

  @ApiPropertyOptional()
  @Length(10, 1200)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  Bio?: string;

  @ApiProperty({ enum: Object.keys(GENDER) })
  @IsIn(Object.keys(GENDER))
  @IsNotEmpty()
  Gender: GENDER;

  @ApiProperty({ example: "2023-11-08" })
  @IsDateString({ strict: true })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  DateOfBirth: string;
}
