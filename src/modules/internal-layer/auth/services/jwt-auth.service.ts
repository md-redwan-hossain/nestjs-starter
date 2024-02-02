import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Cache } from "cache-manager";
import { UUID } from "crypto";
import { EnvVariable } from "../../../../shared/enums/env-variable.enum";
import { IJwtAuthService } from "../interfaces/jwt-auth.interface";
import { USER_ROLE } from "../../../../shared/enums/user-role.enum";

@Injectable()
export class JwtAuthService implements IJwtAuthService {
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

  async issueJsonWebToken(id: string | UUID, role: USER_ROLE, duration?: string): Promise<string> {
    const payload = {
      Id: id,
      Role: role,
      Env: this.configService.getOrThrow(EnvVariable.NODE_ENV)
    };
    return await this.jwtService.signAsync(payload, duration ? { expiresIn: duration } : {});
  }
}
