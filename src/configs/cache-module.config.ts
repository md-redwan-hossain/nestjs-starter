import { CacheModuleOptions, CacheOptionsFactory } from "@nestjs/cache-manager";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StoreConfig } from "cache-manager";
import { redisStore } from "cache-manager-ioredis-yet";
import { defaultRedisConnectionOptions } from "../shared/constants/default-redis-connection-options.constant";
import { EnvVariable } from "../shared/enums/env-variable.enum";
import { redisUrlParser } from "../shared/utils/helpers/redis-utils";

@Injectable()
export class CacheModuleConfig implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions<StoreConfig>> {
    const redisParsedUrlCache = this.configService.getOrThrow(EnvVariable.REDIS_CACHE_URL);

    return {
      store: await redisStore({
        ...redisUrlParser(redisParsedUrlCache),
        ...defaultRedisConnectionOptions()
      })
    };
  }
}
