import { Stuffs } from "./schema";

export type StuffEntity = typeof Stuffs;
export type CreateStuff = typeof Stuffs.$inferInsert;
export type ReadStuff = typeof Stuffs.$inferInsert;
