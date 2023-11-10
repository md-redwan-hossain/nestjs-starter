import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import { HttpStatusMessage } from "../enums/http-status-message.enum";

@Catch(JsonWebTokenError)
export class JsonWebTokenExceptionFilter implements ExceptionFilter {
  catch(exception: JsonWebTokenError, host: ArgumentsHost) {
    const errorBody = {
      message: exception.message,
      error: HttpStatusMessage.UNAUTHORIZED,
      statusCode: HttpStatus.UNAUTHORIZED
    };

    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.UNAUTHORIZED).json(errorBody);
  }
}
