import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const EGender = pgEnum("EGender", ["Male", "Female", "Others"]);
export const EUserRole = pgEnum("EUserRole", ["SuperAdmin", "Admin", "Moderator"]);

export const Stuffs = pgTable(
  "Stuffs",
  {
    Id: uuid("Id").primaryKey().notNull(),
    CreatedAt: timestamp("CreatedAt", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    UpdatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: "string" }),
    FullName: varchar("FullName", { length: 100 }).notNull(),
    Password: text("Password").notNull(),
    DateOfBirth: timestamp("DateOfBirth", { withTimezone: true, mode: "string" }).notNull(),
    Bio: varchar("Bio", { length: 1200 }),
    Role: EUserRole("Role").default("Moderator").notNull(),
    Gender: EGender("Gender").notNull(),
    IsVerified: boolean("IsVerified").default(false).notNull(),
    IsBanned: boolean("IsBanned").default(false).notNull(),
    IsDeactivated: boolean("IsDeactivated").default(false).notNull(),
    ApproverId: uuid("ApproverId"),
    Email: varchar("Email", { length: 254 }).notNull(),
    MobileNumber: varchar("MobileNumber", { length: 14 }),
    IsTwoFactorAuthConfirmed: boolean("IsTwoFactorAuthConfirmed").default(false).notNull(),
    AuthenticatorKey: text("AuthenticatorKey").notNull(),
    RecoveryCodes: text("RecoveryCodes").array().notNull()
  },
  (table) => {
    return {
      IX_Stuffs_Email: uniqueIndex("IX_Stuffs_Email").on(table.Email),
      IX_Stuffs_MobileNumber: uniqueIndex("IX_Stuffs_MobileNumber").on(table.MobileNumber)
    };
  }
);
