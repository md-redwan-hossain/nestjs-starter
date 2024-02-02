import { Global, Module, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { EnvVariable } from "../../shared/enums/env-variable.enum";
import { relationalSchema } from "./drizzle";
import { DrizzlePg } from "./drizzle/types";
import { DRIZZLE_DI_TOKEN, InjectDrizzle } from "./drizzle.decorator";

@Global()
@Module({
  exports: [DRIZZLE_DI_TOKEN],
  providers: [
    {
      inject: [ConfigService],
      provide: DRIZZLE_DI_TOKEN,
      useFactory: async (configService: ConfigService): Promise<DrizzlePg> => {
        return drizzle(postgres(configService.getOrThrow(EnvVariable.DATABASE_URL)), {
          logger: configService.getOrThrow(EnvVariable.NODE_ENV) === "development" ? true : false,
          schema: relationalSchema
        });
      }
    }
  ]
})
export class DataLayerModule implements OnModuleInit {
  constructor(@InjectDrizzle() private readonly db: DrizzlePg) {}
  async onModuleInit() {
    await this.db.execute(sql<number>`select 1 as ping`);
  }
}
