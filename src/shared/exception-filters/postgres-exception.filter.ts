import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";
import { PostgresError } from "postgres";
import { HttpStatusMessage } from "../enums/http-status-message.enum";

@Catch(PostgresError)
export class PostgresExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PostgresExceptionFilter.name);

  catch(exception: PostgresError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let errorMsg: string = "";
    let errorcode: HttpStatus = HttpStatus.BAD_REQUEST;

    switch (exception.code) {
      case "23505":
        errorMsg = `unique_violation: ${exception.constraint_name}`;
        errorcode = HttpStatus.CONFLICT;
        break;

      case "23503":
      case "23514":
      case "23502":
      case "23001":
      case "23000":
      case "22004":
        errorMsg = `${exception.constraint_name ?? exception.code}`;
        break;

      default:
        console.log(exception);
        this.logger.fatal(exception.code, exception, PostgresExceptionFilter.name);
        response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(HttpStatusMessage.INTERNAL_SERVER_ERROR)
          .end();
        return;
    }

    const errorBody = {
      message: errorMsg,
      details: exception.detail ?? exception.message,
      statusCode: errorcode
    };

    response.status(errorcode).json(errorBody).end();
  }
}
