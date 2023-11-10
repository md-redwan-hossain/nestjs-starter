import { ConsoleLogger, Injectable } from "@nestjs/common";
import { LevelOfLog } from "../../../shared/enums/level-of-log.enum";
import { LogWriterService } from "./log-writer.service";

@Injectable()
export class CustomLogger extends ConsoleLogger {
  constructor(private readonly loggingService: LogWriterService) {
    super();
  }

  async error(message: any, stack?: string, context?: string) {
    await this.loggingService.writeLog(LevelOfLog.ERROR, message, stack, context);
    super.error(message, stack, context);
  }

  async fatal(message: any, stack?: string, context?: string) {
    await this.loggingService.writeLog(LevelOfLog.FATAL, message, stack, context);
    super.error(message, stack, context);
  }
}
