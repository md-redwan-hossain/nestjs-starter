import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";
import { MongooseError } from "mongoose";
import { HttpStatusMessage } from "../enums/http-status-message.enum";

@Catch(MongooseError)
export class MongooseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongooseExceptionFilter.name);

  catch(exception: MongooseError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let errorBody = {
      message: exception.message,
      error: HttpStatusMessage.INTERNAL_SERVER_ERROR,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    };

    switch (exception.name) {
      case "CastError":
      case "ValidationError":
        errorBody = {
          message: exception.message,
          error: HttpStatusMessage.BAD_REQUEST,
          statusCode: HttpStatus.BAD_REQUEST
        };
        return response.status(HttpStatus.BAD_REQUEST).json(errorBody).end();

      default:
        break;
    }

    if (errorBody.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.fatal(exception.message, exception.stack, MongooseExceptionFilter.name);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorBody).end();
    }
  }
}
