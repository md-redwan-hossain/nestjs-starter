import { UUID } from "crypto";
import { TotpOptions, UrlOptions, ValidTotpConfig } from "time2fa/index";
import { USER_ROLE } from "../../../../shared/enums/user-role.enum";

export abstract class AbstractAuthService {
  // totp related
  abstract generateTotpKey(opts: TotpOptions): Promise<{
    issuer: string;
    user: string;
    secret: string;
    url: string;
    config: ValidTotpConfig;
  }>;
  abstract validateTotp(token: string, secret: string): Promise<boolean>;
  abstract generateRecoveryCodesForTotpAuth(): Promise<string[]>;
  abstract totpUrlMaker(opts: UrlOptions, configs: ValidTotpConfig): Promise<string>;
  abstract blacklistTokenOnLogout(token: string, expiresIn: string): Promise<void>;
  abstract hashRecoveryCodesForTotpAuth(rawKeys: string[]): Promise<string[]>;
  abstract encryptRecoveryCodesForTotpAuth(rawKeys: string[], secret: string): Promise<string[]>;

  // encryption-decryption related
  abstract encrypt(value: string, secretKey: string): Promise<string>;
  abstract decrypt(value: string, secretKey: string): Promise<string>;

  // password related
  abstract validatePassword(passwordFromDb: string, passwordFromReq: string): Promise<boolean>;

  // jwt related
  abstract tokenBlacklistedStatus(token: string): Promise<boolean>;
  abstract issueJsonWebToken(
    id: string | UUID,
    role: USER_ROLE,
    duration?: string | null
  ): Promise<{ access_token: string }>;
}
