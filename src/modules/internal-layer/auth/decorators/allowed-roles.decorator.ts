import { SetMetadata } from "@nestjs/common";
import { USER_ROLE } from "../../../data-layer/drizzle/types";

export const USER_ROLES_TOKEN = "USER_ROLES";

export function AllowedRoles(args: USER_ROLE[]) {
  return SetMetadata(USER_ROLES_TOKEN, args);
}
