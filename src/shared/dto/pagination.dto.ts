import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Max } from "class-validator";
import { MAX_INT_RANGE } from "../constants/misc.constant";

export class PaginationDto {
  @ApiPropertyOptional()
  @IsPositive()
  @Max(MAX_INT_RANGE)
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  Page: number = 1;

  @ApiPropertyOptional()
  @IsPositive()
  @Max(MAX_INT_RANGE)
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  Limit: number = 10;
}
