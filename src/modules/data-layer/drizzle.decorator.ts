import { Inject } from "@nestjs/common";

export const DRIZZLE_DI_TOKEN = "DRIZZLE_DI_TOKEN";

export function InjectDrizzle(): ParameterDecorator {
  return Inject(DRIZZLE_DI_TOKEN);
}
