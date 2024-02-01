import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottlerModuleOptions, ThrottlerOptionsFactory, seconds } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";
import { EnvVariable } from "../shared/enums/env-variable.enum";
import { defaultRedisConnectionOptions } from "../shared/helpers/default-redis-connection-options";
import { redisUrlParser } from "../shared/helpers/redis-utils";

@Injectable()
export class ThrottlerConfig implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions | Promise<ThrottlerModuleOptions> {
    const redisThrottleUrl = this.configService.getOrThrow(EnvVariable.REDIS_THROTTLE_URL);

    return {
      storage: new ThrottlerStorageRedisService({
        ...redisUrlParser(redisThrottleUrl),
        ...defaultRedisConnectionOptions()
      }),
      throttlers: [
        {
          ttl: seconds(parseInt(this.configService.getOrThrow(EnvVariable.THROTTLE_TTL_SECOND))),
          limit: parseInt(this.configService.getOrThrow(EnvVariable.THROTTLE_LIMIT))
        }
      ]
    };
  }
}
