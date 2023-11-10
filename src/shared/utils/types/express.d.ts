import { UUID } from "crypto";
import { USER_ROLE } from "../constants/db-enums";

declare global {
  namespace Express {
    interface Request {
      jwt?: string;
      user: {
        Id?: string | UUID;
        Role?: USER_ROLE;
        Env?: "development" | "production";
        iat?: string;
        exp?: string;
      };
    }
  }
}
