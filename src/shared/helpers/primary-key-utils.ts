import { ulid } from "ulid";
import { ULIDtoUUID } from "ulid-uuid-converter";
import { Snowflake } from "@theinternetfolks/snowflake";

export class GeneratePrimaryKey {
  static ulidBasedUuid() {
    return ULIDtoUUID(ulid());
  }

  static snowFlake() {
    return Snowflake.generate();
  }
}
