import { Controller, Get, HttpStatus, Query, Res, UseGuards, ValidationPipe } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { Response } from "express";
import { defaultValidationPipeRules } from "../../../shared/constants/default-validation-pipe-rules.constant";
import { USER_ROLE } from "../../../shared/enums/user-role.enum";
import { AllowedRoles } from "../auth/decorators/allowed-roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RoleGuard } from "../auth/guards/role.guard";
import { QueryLoggingDto } from "./dto/query-logging.dto";
import { LoggingResponseDto } from "./dto/response-logging.dto";
import { LoggingService } from "./logging.service";

@ApiTags("logging")
@ApiConsumes("application/json")
@ApiProduces("application/json")
@Controller("logging")
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @AllowedRoles([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: "all error logs" })
  @ApiOkResponse({ type: LoggingResponseDto, isArray: true })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async findOne(
    @Query(new ValidationPipe(defaultValidationPipeRules)) queryParam: QueryLoggingDto,
    @Res() response: Response
  ) {
    const result = await this.loggingService.getAllLogs(queryParam);
    response.status(HttpStatus.OK).send(result.map((elem) => new LoggingResponseDto(elem)));
  }
}
