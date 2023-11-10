import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule, seconds } from "@nestjs/throttler";
import { redisStore } from "cache-manager-ioredis-yet";
import { sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import Joi from "joi";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";
import { StuffModule } from "./modules/business-layer/stuff/stuff.module";
import { DataLayerModule } from "./modules/data-layer/data-layer.module";
import { DrizzleQueryBuilderSyntax } from "./modules/data-layer/drizzle.decorator";
import { AuthModule } from "./modules/internal-layer/auth/auth.module";
import { EmailSenderModule } from "./modules/internal-layer/email-sender/email-sender.module";
import { HealthCheckerModule } from "./modules/internal-layer/health-checker/health-checker.module";
import { LoggingModule } from "./modules/internal-layer/logging/logging.module";
import { defaultRedisConnectionOptions } from "./shared/constants/default-redis-connection-options.constant";
import { EnvVariable } from "./shared/enums/env-variable.enum";
import { GlobalExceptionFilter } from "./shared/exception-filters/global-exception.filter";
import { JsonWebTokenExceptionFilter } from "./shared/exception-filters/jsonwebtoken-exception.filter";
import { MongoExceptionFilter } from "./shared/exception-filters/mongo-exception.filter";
import { MongooseExceptionFilter } from "./shared/exception-filters/mongoose-exception.filter";
import { PostgresExceptionFilter } from "./shared/exception-filters/postgres-exception.filter";
import { redisUrlParser } from "./shared/utils/helpers/redis-utils";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env?.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: Joi.object({
        COMPANY_NAME: Joi.string().required(),
        COMPANY_EMAIL: Joi.string().email().required(),
        SERVER_PORT: Joi.number().min(0).max(65535).default(3000),
        NODE_ENV: Joi.string().valid("development", "production").required(),
        JWT_SECRET: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        LOGGING_DATABASE_URL: Joi.string().required(),
        REDIS_CACHE_URL: Joi.string().required(),
        REDIS_BULLMQ_URL: Joi.string().required(),
        REDIS_THROTTLE_URL: Joi.string().required(),
        THROTTLE_TTL_SECOND: Joi.number().min(1).required(),
        THROTTLE_LIMIT: Joi.number().min(1).required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required()
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false
      }
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const loggingDbUrl = configService.getOrThrow(EnvVariable.LOGGING_DATABASE_URL);

        return {
          uri: loggingDbUrl,
          serverSelectionTimeoutMS: 5000,
          retryAttempts: 1,
          retryDelay: 2000,
          lazyConnection: false
        };
      }
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisThrottleUrl = configService.getOrThrow(EnvVariable.REDIS_THROTTLE_URL);

        return {
          storage: new ThrottlerStorageRedisService({
            ...redisUrlParser(redisThrottleUrl),
            ...defaultRedisConnectionOptions()
          }),
          throttlers: [
            {
              ttl: seconds(parseInt(configService.getOrThrow(EnvVariable.THROTTLE_TTL_SECOND))),
              limit: parseInt(configService.getOrThrow(EnvVariable.THROTTLE_LIMIT))
            }
          ]
        };
      }
    }),

    CacheModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisParsedUrlCache = configService.getOrThrow(EnvVariable.REDIS_CACHE_URL);

        return {
          store: await redisStore({
            ...redisUrlParser(redisParsedUrlCache),
            ...defaultRedisConnectionOptions()
          })
        };
      }
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisParsedUrlBullmq = configService.getOrThrow(EnvVariable.REDIS_BULLMQ_URL);

        return {
          connection: {
            ...redisUrlParser(redisParsedUrlBullmq),
            ...defaultRedisConnectionOptions(true)
          }
        };
      }
    }),

    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter
    }),

    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    LoggingModule,
    DataLayerModule,
    AuthModule,
    StuffModule,
    HealthCheckerModule,
    EmailSenderModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_FILTER, useClass: PostgresExceptionFilter },
    { provide: APP_FILTER, useClass: MongoExceptionFilter },
    { provide: APP_FILTER, useClass: MongooseExceptionFilter },
    { provide: APP_FILTER, useClass: JsonWebTokenExceptionFilter }
  ]
})
export class AppModule implements OnModuleInit {
  constructor(@DrizzleQueryBuilderSyntax() private readonly db: PostgresJsDatabase) {}

  async onModuleInit() {
    await this.db.execute(sql<number>`select 1 as ping`);
  }
}
