import { ArgumentsHost, Catch, InternalServerErrorException, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof InternalServerErrorException) {
      this.logger.fatal(exception.message, exception.stack, exception.name);
    }
    super.catch(exception, host);
  }
}
