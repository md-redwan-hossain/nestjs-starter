import { SetMetadata } from "@nestjs/common";
import { USER_ROLE } from "../../../../shared/enums/user-role.enum";

export const USER_ROLES_DI_TOKEN = "USER_ROLES_DI_TOKEN";

export function AllowedRoles(args: USER_ROLE[]) {
  return SetMetadata(USER_ROLES_DI_TOKEN, args);
}
