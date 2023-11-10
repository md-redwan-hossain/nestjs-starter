import * as relations from "./relations";
import * as schemas from "./schema";

export const relationalSchema: typeof relations & typeof schemas = { ...relations, ...schemas };
