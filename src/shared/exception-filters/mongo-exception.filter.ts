import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";
import { MongoError } from "mongodb";
import { HttpStatusMessage } from "../enums/http-status-message.enum";

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: MongoError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let errorBody = {
      message: exception.code,
      error: HttpStatusMessage.INTERNAL_SERVER_ERROR,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    };

    switch (exception.code) {
      case 11000:
        errorBody = {
          message: exception.code,
          error: HttpStatusMessage.CONFLICT,
          statusCode: HttpStatus.CONFLICT
        };
        return response.status(HttpStatus.CONFLICT).json(errorBody).end();
    }

    if (errorBody.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.fatal(exception.message, exception.stack, MongoExceptionFilter.name);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorBody).end();
    }
  }
}
