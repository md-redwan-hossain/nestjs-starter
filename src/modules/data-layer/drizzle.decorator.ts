import { Inject } from "@nestjs/common";

export const DRIZZLE_QUERY_BUILDER_SYNTAX = "DRIZZLE_QUERY_BUILDER_SYNTAX";
export const DRIZZLE_ORM_SYNTAX = "DRIZZLE_ORM_SYNTAX";

export function DrizzleQueryBuilderSyntax(): ParameterDecorator {
  return Inject(DRIZZLE_QUERY_BUILDER_SYNTAX);
}

export function DrizzleOrmSyntax(): ParameterDecorator {
  return Inject(DRIZZLE_ORM_SYNTAX);
}
