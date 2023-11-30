import { Inject } from "@nestjs/common";

export const STUFF_DI_TOKEN = "STUFF_DI_TOKEN";
export function InjectStuffEntity(): ParameterDecorator {
  return Inject(STUFF_DI_TOKEN);
}
