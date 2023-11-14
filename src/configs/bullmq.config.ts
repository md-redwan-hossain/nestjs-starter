import { SharedBullConfigurationFactory } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueueOptions } from "bullmq";
import { defaultRedisConnectionOptions } from "../shared/constants/default-redis-connection-options.constant";
import { EnvVariable } from "../shared/enums/env-variable.enum";
import { redisUrlParser } from "../shared/utils/helpers/redis-utils";

@Injectable()
export class BullmqConfig implements SharedBullConfigurationFactory {
  constructor(private readonly configService: ConfigService) {}
  createSharedConfiguration(): QueueOptions | Promise<QueueOptions> {
    const redisParsedUrlBullmq = this.configService.getOrThrow(EnvVariable.REDIS_BULLMQ_URL);

    return {
      connection: {
        ...redisUrlParser(redisParsedUrlBullmq),
        ...defaultRedisConnectionOptions(true)
      }
    };
  }
}
