import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { USER_ROLE } from "../../../../shared/enums/user-role.enum";
import { USER_ROLES_TOKEN } from "../decorators/allowed-roles.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const userRoles = this.reflector.get<USER_ROLE[]>(USER_ROLES_TOKEN, context.getHandler());
    const roleCount = userRoles.length;
    
    if (roleCount === 0) return true;

    const request = context.switchToHttp().getRequest();

    const roleInRequest = request?.user?.Role;

    if (!roleInRequest) {
      throw new BadRequestException("no Role found in request");
    }

    const status = userRoles.some((role) => role === roleInRequest);

    if (status) return true;

    let errorMsg = "you are not ";
    if (roleCount > 1) errorMsg = errorMsg.concat(`one of ${userRoles.toString()}`);
    else errorMsg = errorMsg.concat(userRoles.toString());

    throw new ForbiddenException(errorMsg);
  }
}
