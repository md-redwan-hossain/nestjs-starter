import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as relations from "./relations";
import * as schemas from "./schema";

export const relationalSchema: typeof relations & typeof schemas = { ...relations, ...schemas };

export type DrizzlePg = PostgresJsDatabase<typeof relationalSchema>;
