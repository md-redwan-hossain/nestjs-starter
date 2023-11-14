import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";
import { EnvVariable } from "../shared/enums/env-variable.enum";

@Injectable()
export class MongooseConfig implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    const loggingDbUrl = this.configService.getOrThrow(EnvVariable.LOGGING_DATABASE_URL);

    return {
      uri: loggingDbUrl,
      serverSelectionTimeoutMS: 5000,
      retryAttempts: 1,
      retryDelay: 2000,
      lazyConnection: false
    };
  }
}
