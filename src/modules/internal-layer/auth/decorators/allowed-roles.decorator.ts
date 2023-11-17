import { SetMetadata } from "@nestjs/common";
import { USER_ROLE } from "../../../../shared/enums/user-role.enum";

export const USER_ROLES_TOKEN = "USER_ROLES";

export function AllowedRoles(args: USER_ROLE[]) {
  return SetMetadata("userRoles", args);
}
