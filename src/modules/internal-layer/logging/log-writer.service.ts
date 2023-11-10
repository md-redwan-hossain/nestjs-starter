import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LevelOfLog } from "../../../shared/enums/level-of-log.enum";
import { Logging, LoggingDocument } from "./enitities/logging.entity";

@Injectable()
export class LogWriterService {
  constructor(@InjectModel(Logging.name) private loggingModel: Model<LoggingDocument>) {}

  async writeLog(level: LevelOfLog, message: any, stack?: string, context?: string) {
    await new this.loggingModel({
      timestamp: new Date().toLocaleString(),
      level: level,
      context: context,
      message: message,
      stack_trace: stack
    }).save();
  }
}
