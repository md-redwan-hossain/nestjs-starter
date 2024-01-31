import { UUID } from "crypto";
import { USER_ROLE } from "../constants/db-enums";

declare global {
  namespace Express {
    interface Request {
      jwt?: string;
      user: {
        id?: string | UUID;
        role?: USER_ROLE;
        env?: "development" | "production";
        iat?: string;
        exp?: string;
      };
    }
  }
}
