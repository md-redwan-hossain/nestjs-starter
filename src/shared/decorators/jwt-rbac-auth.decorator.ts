import { UseGuards, applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { AllowedRoles } from "../../modules/internal-layer/auth/decorators/allowed-roles.decorator";
import { JwtAuthGuard } from "../../modules/internal-layer/auth/guards/jwt-auth.guard";
import { RoleGuard } from "../../modules/internal-layer/auth/guards/role.guard";
import { USER_ROLE } from "../enums/user-role.enum";

export function JwtRbacAuth(roles: USER_ROLE[]) {
  return applyDecorators(
    AllowedRoles(roles),
    UseGuards(JwtAuthGuard),
    UseGuards(RoleGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
    ApiForbiddenResponse()
  );
}
