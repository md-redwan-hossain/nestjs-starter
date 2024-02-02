import { Global, Module } from "@nestjs/common";
import {
  JWT_AUTH_SERVICE_DI_TOKEN,
  TWO_FACTOR_AUTH_SERVICE_DI_TOKEN
} from "./decorators/auth.decorator";
import { JwtAuthService } from "./services/jwt-auth.service";
import { TwoFactorAuthService } from "./services/two-factor-auth.service";

@Global()
@Module({
  providers: [
    { provide: JWT_AUTH_SERVICE_DI_TOKEN, useClass: JwtAuthService },
    { provide: TWO_FACTOR_AUTH_SERVICE_DI_TOKEN, useClass: TwoFactorAuthService }
  ],
  exports: [JWT_AUTH_SERVICE_DI_TOKEN, TWO_FACTOR_AUTH_SERVICE_DI_TOKEN]
})
export class AuthModule {}
