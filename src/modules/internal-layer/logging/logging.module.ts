import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CustomLogger } from "./custom-logger.provider";
import { Logging, LoggingSchema } from "./enitities/logging.entity";
import { LogWriterService } from "./log-writer.service";
import { LoggingController } from "./logging.controller";
import { LoggingService } from "./logging.service";

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: Logging.name, schema: LoggingSchema }])],
  controllers: [LoggingController],
  providers: [LoggingService, LogWriterService, CustomLogger],
  exports: [CustomLogger, MongooseModule]
})
export class LoggingModule {}
