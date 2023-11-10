import { ApiResponseProperty } from "@nestjs/swagger";
import { LevelOfLog } from "../../../../shared/enums/level-of-log.enum";
import { LoggingDocument } from "../enitities/logging.entity";

export class LoggingResponseDto {
  @ApiResponseProperty()
  timestamp: string;

  @ApiResponseProperty({ enum: LevelOfLog })
  level: LevelOfLog;

  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty()
  context?: string;

  @ApiResponseProperty()
  stack_trace?: string;

  constructor(logging: LoggingDocument) {
    this.timestamp = logging.timestamp.toLocaleString();
    this.level = logging.level;
    this.message = logging.message;
    this.context = logging.context;
    this.stack_trace = logging.stack_trace;
  }
}
