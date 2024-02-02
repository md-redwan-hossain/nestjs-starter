import { TotpOptions, UrlOptions, ValidTotpConfig } from "time2fa/index";

export interface ITwoFactorAuthService {
  generateTotpKey(opts: TotpOptions): Promise<{
    issuer: string;
    user: string;
    secret: string;
    url: string;
    config: ValidTotpConfig;
  }>;

  verifyEncryptedTotp(encryptedKey: string, decryptorKey: string, token: string): Promise<boolean>;
  reEncryptTotpKey(decryptor: string, encryptor: string, encryptedKey: string): Promise<string>;
  encryptTotpKey(key: string, encryptor: string): Promise<string>;
  validateTotp(token: string, secret: string): Promise<boolean>;
  generateRecoveryCodesForTotpAuth(): Promise<string[]>;
  totpUrlMaker(opts: UrlOptions, configs: ValidTotpConfig): Promise<string>;
  hashRecoveryCodesForTotpAuth(rawKeys: string[]): Promise<string[]>;
  encryptRecoveryCodesForTotpAuth(rawKeys: string[], encryptor: string): Promise<string[]>;
}
