START TRANSACTION;

CREATE TYPE "EGender" AS ENUM ('Male', 'Female', 'Others');

CREATE TYPE "EUserRole" AS ENUM ('SuperAdmin', 'Admin', 'Moderator');

CREATE TABLE "Stuffs" (
    "Id" uuid NOT NULL,
    "Role" "EUserRole" NOT NULL DEFAULT 'Moderator' :: "EUserRole",
    "ApproverId" uuid NULL,
    "Email" character varying(254) NOT NULL,
    "MobileNumber" character varying(14) NULL,
    "Bio" character varying(1000) NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NULL,
    "FullName" character varying(100) NOT NULL,
    "Password" text NOT NULL,
    "DateOfBirth" timestamp with time zone NOT NULL,
    "ProfilePicture" character varying(500) NULL,
    "Gender" "EGender" NOT NULL,
    "AuthenticatorKey" text NULL,
    "RecoveryCodes" text [] NULL,
    "IsTwoFactorAuthConfirmed" boolean NOT NULL DEFAULT FALSE,
    "IsVerified" boolean NOT NULL DEFAULT FALSE,
    "IsBanned" boolean NOT NULL DEFAULT FALSE,
    "IsDeactivated" boolean NOT NULL DEFAULT FALSE,
    CONSTRAINT "PK_Stuffs" PRIMARY KEY ("Id"),
    CONSTRAINT "Ensure_Stuff_Role" CHECK ("Role" IN ('SuperAdmin', 'Admin', 'Moderator'))
);

CREATE UNIQUE INDEX "IX_Stuffs_Email" ON "Stuffs" ("Email");

CREATE UNIQUE INDEX "IX_Stuffs_MobileNumber" ON "Stuffs" ("MobileNumber");

COMMIT;