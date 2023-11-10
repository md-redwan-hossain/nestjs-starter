import { ConfigService } from "@nestjs/config";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { EnvVariable } from "../../shared/enums/env-variable.enum";
import { DRIZZLE_ORM_SYNTAX, DRIZZLE_QUERY_BUILDER_SYNTAX } from "./constants";
import { relationalSchema } from "./drizzle";

export const databaseProviders = [
  {
    inject: [ConfigService],
    provide: DRIZZLE_QUERY_BUILDER_SYNTAX,
    useFactory: async (configService: ConfigService): Promise<PostgresJsDatabase> => {
      return drizzle(postgres(configService.getOrThrow(EnvVariable.DATABASE_URL)), {
        logger: configService.getOrThrow(EnvVariable.NODE_ENV) === "development" ? true : false
      });
    }
  },
  {
    inject: [ConfigService],
    provide: DRIZZLE_ORM_SYNTAX,
    useFactory: async (
      configService: ConfigService
    ): Promise<PostgresJsDatabase<typeof relationalSchema>> => {
      return drizzle(postgres(configService.getOrThrow(EnvVariable.DATABASE_URL)), {
        logger: configService.getOrThrow(EnvVariable.NODE_ENV) === "development" ? true : false,
        schema: relationalSchema
      });
    }
  }
];
