import { UUID } from "crypto";
import { USER_ROLE } from "../../../../shared/enums/user-role.enum";

export abstract class AbstractJwtAuthService {
  abstract tokenBlacklistedStatus(token: string): Promise<boolean>;
  abstract blacklistTokenOnLogout(token: string, expiresIn: string): Promise<void>;
  abstract issueJsonWebToken(id: string, role: USER_ROLE, duration?: string): Promise<string>;
}
