import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";
import { PostgresError } from "postgres";
import { HttpStatusMessage } from "../enums/http-status-message.enum";

@Catch(PostgresError)
export class PostgresExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PostgresExceptionFilter.name);

  catch(exception: PostgresError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception.message.includes("GROUP BY clause")) {
      this.logger.fatal(exception.message, exception.stack, PostgresExceptionFilter.name);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(HttpStatusMessage.INTERNAL_SERVER_ERROR)
        .end();
      return;
    }

    let uniqueConstraintError = false;

    if (exception.message.includes("duplicate key value violates unique constraint"))
      uniqueConstraintError = true;

    const errorBody = {
      message: exception.detail
        ? exception.detail?.replaceAll('"', "'")
        : exception.message.replaceAll('"', "'"),
      error: uniqueConstraintError ? HttpStatusMessage.CONFLICT : HttpStatusMessage.BAD_REQUEST,
      statusCode: uniqueConstraintError ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST
    };

    response
      .status(uniqueConstraintError ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST)
      .json(errorBody)
      .end();
  }
}
