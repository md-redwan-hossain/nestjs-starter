import { Inject } from "@nestjs/common";
import { DRIZZLE_ORM_SYNTAX, DRIZZLE_QUERY_BUILDER_SYNTAX } from "./constants";

export function DrizzleQueryBuilderSyntax(): ParameterDecorator {
  return Inject(DRIZZLE_QUERY_BUILDER_SYNTAX);
}

export function DrizzleOrmSyntax(): ParameterDecorator {
  return Inject(DRIZZLE_ORM_SYNTAX);
}
