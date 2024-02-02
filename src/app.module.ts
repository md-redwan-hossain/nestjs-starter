import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import Joi from "joi";
import { BullmqConfig } from "./configs/bullmq.config";
import { CacheModuleConfig } from "./configs/cache-module.config";
import { JwtModuleConfig } from "./configs/jwt-module.config";
import { MongooseConfig } from "./configs/mongoose.config";
import { ThrottlerConfig } from "./configs/throttler.config";
import { UserManagementModule } from "./modules/business-layer/user-management/user-management.module";
import { DataLayerModule } from "./modules/data-layer/data-layer.module";
import { AuthModule } from "./modules/internal-layer/auth/auth.module";
import { EmailSenderModule } from "./modules/internal-layer/email-sender/email-sender.module";
import { HealthCheckerModule } from "./modules/internal-layer/health-checker/health-checker.module";
import { LoggingModule } from "./modules/internal-layer/logging/logging.module";
import { GlobalExceptionFilter } from "./shared/exception-filters/global-exception.filter";
import { JsonWebTokenExceptionFilter } from "./shared/exception-filters/jsonwebtoken-exception.filter";
import { MongoExceptionFilter } from "./shared/exception-filters/mongo-exception.filter";
import { MongooseExceptionFilter } from "./shared/exception-filters/mongoose-exception.filter";
import { PostgresExceptionFilter } from "./shared/exception-filters/postgres-exception.filter";
import { CryptographyModule } from "./modules/internal-layer/cryptography/cryptography.module";

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
        ACCOUNT_ACTIVATION_CODE_VALIDITY_DURATION: Joi.string().required(),
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

    MongooseModule.forRootAsync({ useClass: MongooseConfig }),
    JwtModule.registerAsync({ global: true, useClass: JwtModuleConfig }),
    ThrottlerModule.forRootAsync({ useClass: ThrottlerConfig }),
    CacheModule.registerAsync({ isGlobal: true, useClass: CacheModuleConfig }),
    BullModule.forRootAsync({ useClass: BullmqConfig }),
    EventEmitterModule.forRoot({ global: true }),
    ScheduleModule.forRoot(),

    // Internal
    LoggingModule,
    HealthCheckerModule,
    EmailSenderModule,
    AuthModule,
    CryptographyModule,

    // Data
    DataLayerModule,

    //Business
    UserManagementModule
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
export class AppModule {}
