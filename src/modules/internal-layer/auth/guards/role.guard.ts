import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { EnvVariable } from "../../../../shared/enums/env-variable.enum";
import { USER_ROLE } from "../../../../shared/enums/user-role.enum";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const userRoles = this.reflector.get<USER_ROLE[]>("userRoles", context.getHandler());
    const roleCount = userRoles.length;

    if (roleCount === 0) return true;

    const request = context.switchToHttp().getRequest();

    const envInRequest = request?.user?.Env;
    const roleInRequest = request?.user?.Role;

    if (this.configService.getOrThrow(EnvVariable.NODE_ENV) !== envInRequest || !roleInRequest) {
      throw new ForbiddenException("mismatch in token Env");
    }
    const status = userRoles.some((role) => role === roleInRequest);

    if (status) return true;
    throw new ForbiddenException(
      `you are not ${roleCount > 1 ? "one of" : ""} ${userRoles.toString()}`
    );
  }
}
