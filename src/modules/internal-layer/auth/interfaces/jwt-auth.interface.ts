import { USER_ROLE } from "../../../../shared/enums/user-role.enum";

export interface IJwtAuthService {
  tokenBlacklistedStatus(token: string): Promise<boolean>;
  blacklistTokenOnLogout(token: string, expiresIn: string): Promise<void>;
  issueJsonWebToken(id: string, role: USER_ROLE, duration?: string): Promise<string>;
}
