import { Global, Module } from "@nestjs/common";
import { AbstractJwtAuthService } from "./abstracts/jwt-auth.abstract";
import { AbstractTwoFactorAuthService } from "./abstracts/two-factor-auth.abstract";
import { CryptographyService } from "./services/cryptography.service";
import { JwtAuthService } from "./services/jwt-auth.service";
import { TwoFactorAuthService } from "./services/two-factor-auth.service";

@Global()
@Module({
  providers: [
    TwoFactorAuthService,
    CryptographyService,
    { provide: AbstractJwtAuthService, useClass: JwtAuthService },
    { provide: AbstractTwoFactorAuthService, useClass: TwoFactorAuthService }
  ],
  exports: [AbstractJwtAuthService, AbstractTwoFactorAuthService]
})
export class AuthModule {}
