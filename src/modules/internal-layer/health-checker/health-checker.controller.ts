import { Controller, Get, HttpStatus, Res, VERSION_NEUTRAL } from "@nestjs/common";
import {
  ApiBadGatewayResponse,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags
} from "@nestjs/swagger";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { Throttle, seconds } from "@nestjs/throttler";
import { Response } from "express";
import { JwtRbacAuth } from "../../../shared/decorators/jwt-rbac-auth.decorator";
import { USER_ROLE } from "../../../shared/enums/user-role.enum";
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

  @JwtRbacAuth([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @ApiOkResponse()
  @ApiOperation({ summary: "check database status" })
  @Get("db")
  @HealthCheck()
  checkDatabase() {
    return this.health.check([() => this.drizzleHealthIndicator.pingCheck()]);
  }
}
