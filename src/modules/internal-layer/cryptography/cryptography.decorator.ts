import { Inject } from "@nestjs/common";

export const CRYPTOGRAPHY_SERVICE_DI_TOKEN = "CRYPTOGRAPHY_SERVICE_DI_TOKEN";

export function InjectCryptographyService(): ParameterDecorator {
  return Inject(CRYPTOGRAPHY_SERVICE_DI_TOKEN);
}
