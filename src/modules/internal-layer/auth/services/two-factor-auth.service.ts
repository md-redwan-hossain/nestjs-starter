import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import {
  Totp,
  TotpOptions,
  UrlOptions,
  ValidTotpConfig,
  generateBackupCodes,
  generateUrl
} from "time2fa";
import { AbstractTwoFactorAuthService } from "../abstracts/two-factor-auth.abstract";
import { CryptographyService } from "./cryptography.service";

@Injectable()
export class TwoFactorAuthService implements AbstractTwoFactorAuthService {
  constructor(private readonly cryptographyService: CryptographyService) {}

  async encryptTotpKey(key: string, encryptor: string): Promise<string> {
    return await this.cryptographyService.encrypt(key, encryptor);
  }

  async generateTotpKey(opts: TotpOptions): Promise<{
    issuer: string;
    user: string;
    secret: string;
    url: string;
    config: ValidTotpConfig;
  }> {
    return new Promise((resolve) => {
      resolve(Totp.generateKey(opts, { algo: "sha256" }));
    });
  }

  async verifyEncryptedTotp(
    encryptedKey: string,
    decryptorKey: string,
    token: string
  ): Promise<boolean> {
    const decryptedSecret = await this.cryptographyService.decrypt(encryptedKey, decryptorKey);
    if (!decryptedSecret) return false;
    return await this.validateTotp(token, decryptedSecret);
  }

  async validateTotp(token: string, secret: string): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(Totp.validate({ passcode: token, secret }, { algo: "sha256" }));
    });
  }

  async totpUrlMaker(opts: UrlOptions, configs: ValidTotpConfig): Promise<string> {
    return new Promise((resolve) => {
      resolve(generateUrl(opts, configs));
    });
  }

  async generateRecoveryCodesForTotpAuth(): Promise<string[]> {
    return new Promise((resolve) => {
      resolve(generateBackupCodes());
    });
  }

  async hashRecoveryCodesForTotpAuth(rawKeys: string[]): Promise<string[]> {
    const hashedKeys: string[] = [];

    for (const elem of rawKeys) {
      hashedKeys.push(await bcrypt.hash(elem, 8));
    }

    return hashedKeys;
  }

  async reEncryptTotpKey(decryptor: string, encryptor: string, encryptedKey: string) {
    const oldDecryptedKey = await this.cryptographyService.decrypt(encryptedKey, decryptor);
    return await this.cryptographyService.encrypt(oldDecryptedKey, encryptor);
  }

  async encryptRecoveryCodesForTotpAuth(rawKeys: string[], encryptor: string): Promise<string[]> {
    const encryptedKeys: string[] = [];

    for (const elem of rawKeys) {
      encryptedKeys.push(await this.cryptographyService.encrypt(elem, encryptor));
    }

    return encryptedKeys;
  }
}
