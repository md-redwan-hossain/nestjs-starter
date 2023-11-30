import { TotpOptions, UrlOptions, ValidTotpConfig } from "time2fa/index";

export abstract class AbstractTwoFactorAuthService {
  abstract generateTotpKey(opts: TotpOptions): Promise<{
    issuer: string;
    user: string;
    secret: string;
    url: string;
    config: ValidTotpConfig;
  }>;

  abstract verifyEncryptedTotp(
    encryptedKey: string,
    decryptorKey: string,
    token: string
  ): Promise<boolean>;

  abstract reEncryptTotpKey(
    decryptor: string,
    encryptor: string,
    encryptedKey: string
  ): Promise<string>;

  abstract encryptTotpKey(key: string, encryptor: string): Promise<string>;
  abstract validateTotp(token: string, secret: string): Promise<boolean>;
  abstract generateRecoveryCodesForTotpAuth(): Promise<string[]>;
  abstract totpUrlMaker(opts: UrlOptions, configs: ValidTotpConfig): Promise<string>;
  abstract hashRecoveryCodesForTotpAuth(rawKeys: string[]): Promise<string[]>;
  abstract encryptRecoveryCodesForTotpAuth(rawKeys: string[], encryptor: string): Promise<string[]>;
}
