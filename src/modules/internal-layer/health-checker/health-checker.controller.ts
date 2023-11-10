import { Controller, Get, HttpStatus, Res, UseGuards, VERSION_NEUTRAL } from "@nestjs/common";
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { Throttle, seconds } from "@nestjs/throttler";
import { Response } from "express";
import { USER_ROLE } from "../../../shared/enums/user-role.enum";
import { AllowedRoles } from "../../internal-layer/auth/decorators/allowed-roles.decorator";
import { JwtAuthGuard } from "../../internal-layer/auth/guards/jwt-auth.guard";
import { RoleGuard } from "../../internal-layer/auth/guards/role.guard";
import { DrizzleHealthIndicator } from "./drizzle.health";

@ApiTags("health-checker")
@ApiConsumes("application/json")
@ApiProduces("application/json")
@Controller({ path: "health-checker", version: VERSION_NEUTRAL })
export class HealthCheckerController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly drizzleHealthIndicator: DrizzleHealthIndicator
  ) {}

  @ApiOkResponse()
  @ApiBadGatewayResponse()
  @ApiOperation({ summary: "check server status" })
  @Throttle({ default: { limit: 1, ttl: seconds(1) } })
  @Get("server")
  checkServer(@Res() response: Response) {
    response.status(HttpStatus.OK).end();
  }

  @AllowedRoles([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOperation({ summary: "check database status" })
  @Get("db")
  @HealthCheck()
  checkDatabase() {
    return this.health.check([() => this.drizzleHealthIndicator.pingCheck()]);
  }
}
