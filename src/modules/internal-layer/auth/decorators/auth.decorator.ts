import { Inject } from "@nestjs/common";

export const JWT_AUTH_SERVICE_DI_TOKEN = "JWT_AUTH_SERVICE_DI_TOKEN";

export function InjectJwtAuthService(): ParameterDecorator {
  return Inject(JWT_AUTH_SERVICE_DI_TOKEN);
}

export const TWO_FACTOR_AUTH_SERVICE_DI_TOKEN = "TWO_FACTOR_AUTH_SERVICE_DI_TOKEN";

export function InjectTwoFactorAuthService(): ParameterDecorator {
  return Inject(TWO_FACTOR_AUTH_SERVICE_DI_TOKEN);
}
