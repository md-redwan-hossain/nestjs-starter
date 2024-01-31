import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBooleanString, IsDateString, IsIn, IsOptional, IsString, Length } from "class-validator";
import { IsValidTime } from "../../../../shared/decorators/is-valid-time.decorator";
import { PaginationDto } from "../../../../shared/dto/pagination.dto";
import { LevelOfLog } from "../../../../shared/enums/level-of-log.enum";

export class QueryLoggingDto extends PaginationDto {
  @ApiPropertyOptional({ enum: LevelOfLog, isArray: true })
  @IsIn(Object.keys(LevelOfLog), { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsOptional()
  level: LevelOfLog[];

  @ApiPropertyOptional({
    description: "valid ISO 8601 date string",
    example: "2023-11-08",
    type: Date
  })
  @IsDateString({ strict: true })
  @IsOptional()
  date: Date;

  @ApiPropertyOptional({
    description: "should be in the format 'hh:mm AM/PM'",
    example: "05:15 AM"
  })
  @IsValidTime()
  @Length(8, 8)
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  time: string;

  @ApiPropertyOptional()
  @IsBooleanString()
  @IsOptional()
  inverse_datetime: boolean;
}
