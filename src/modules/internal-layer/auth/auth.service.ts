import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { Cache } from "cache-manager";
import { UUID } from "crypto";
import CryptoJS from "crypto-js";
import {
  Totp,
  TotpOptions,
  UrlOptions,
  ValidTotpConfig,
  generateBackupCodes,
  generateUrl
} from "time2fa";
import { EnvVariable } from "../../../shared/enums/env-variable.enum";
import { AbstractAuthService } from "./abstracts/auth.abstract";
import { USER_ROLE } from "../../../shared/enums/user-role.enum";

@Injectable()
export class AuthService implements AbstractAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async blacklistTokenOnLogout(token: string, expiresIn: string): Promise<void> {
    const ttl = parseInt(expiresIn) * 1000 - Date.now();
    await this.cacheManager.set(`blacklist_jwt ${token}`, 1, ttl > 0 ? ttl : 1);
  }

  async tokenBlacklistedStatus(token: string): Promise<boolean> {
    const tokenInCache = await this.cacheManager.get(`blacklist_jwt ${token}`);
    return tokenInCache ? true : false;
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

  async encrypt(value: string, secretKey: string): Promise<string> {
    return new Promise((resolve) => {
      resolve(CryptoJS.AES.encrypt(value, secretKey).toString());
    });
  }

  async decrypt(value: string, secretKey: string): Promise<string> {
    return new Promise((resolve) => {
      resolve(CryptoJS.AES.decrypt(value, secretKey).toString(CryptoJS.enc.Utf8));
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

  async encryptRecoveryCodesForTotpAuth(rawKeys: string[], secret: string): Promise<string[]> {
    const encryptedKeys: string[] = [];

    for (const elem of rawKeys) {
      encryptedKeys.push(await this.encrypt(elem, secret));
    }

    return encryptedKeys;
  }

  async validatePassword(passwordFromDb: string, passwordFromReq: string): Promise<boolean> {
    return await bcrypt.compare(passwordFromReq, passwordFromDb);
  }

  async issueJsonWebToken(
    id: string | UUID,
    role: USER_ROLE,
    duration: string | null = null
  ): Promise<{ access_token: string }> {
    const payload = {
      Id: id,
      Role: role,
      Env: this.configService.getOrThrow(EnvVariable.NODE_ENV)
    };
    return {
      access_token: await this.jwtService.signAsync(
        payload,
        duration ? { expiresIn: duration } : {}
      )
    };
  }
}
