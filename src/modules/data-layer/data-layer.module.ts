import { Global, Module } from "@nestjs/common";
import { databaseProviders } from "./ database.providers";
import { DRIZZLE_ORM_SYNTAX, DRIZZLE_QUERY_BUILDER_SYNTAX } from "./drizzle.decorator";

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [DRIZZLE_QUERY_BUILDER_SYNTAX, DRIZZLE_ORM_SYNTAX]
})
export class DataLayerModule {}
