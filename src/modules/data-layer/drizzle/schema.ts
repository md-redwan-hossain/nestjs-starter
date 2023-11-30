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
    Role: EUserRole("Role").default("Moderator").notNull(),
    ApproverId: uuid("ApproverId"),
    Email: varchar("Email", { length: 254 }).notNull(),
    MobileNumber: varchar("MobileNumber", { length: 14 }),
    Bio: varchar("Bio", { length: 1000 }),
    CreatedAt: timestamp("CreatedAt", { withTimezone: true, mode: "string" }).notNull(),
    UpdatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: "string" }),
    FullName: varchar("FullName", { length: 100 }).notNull(),
    Password: text("Password").notNull(),
    DateOfBirth: timestamp("DateOfBirth", { withTimezone: true, mode: "string" }).notNull(),
    ProfilePicture: varchar("ProfilePicture", { length: 500 }),
    Gender: EGender("Gender").notNull(),
    AuthenticatorKey: text("AuthenticatorKey"),
    RecoveryCodes: text("RecoveryCodes").array(),
    IsTwoFactorAuthConfirmed: boolean("IsTwoFactorAuthConfirmed").default(false).notNull(),
    IsVerified: boolean("IsVerified").default(false).notNull(),
    IsBanned: boolean("IsBanned").default(false).notNull(),
    IsDeactivated: boolean("IsDeactivated").default(false).notNull()
  },
  (table) => {
    return {
      IX_Stuffs_Email: uniqueIndex("IX_Stuffs_Email").on(table.Email),
      IX_Stuffs_MobileNumber: uniqueIndex("IX_Stuffs_MobileNumber").on(table.MobileNumber)
    };
  }
);
