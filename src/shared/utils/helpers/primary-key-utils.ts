import { ulid } from "ulid";
import { ULIDtoUUID } from "ulid-uuid-converter";

export function ulidInUuidGenerator() {
  return ULIDtoUUID(ulid());
}

export function pkGenerator() {
  return ulidInUuidGenerator();
}
