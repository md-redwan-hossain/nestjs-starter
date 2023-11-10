import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { EnvVariable } from "../../../shared/enums/env-variable.enum";
import { AbstractAuthService } from "./abstracts/auth.abstract";
import { AuthService } from "./auth.service";

const jwtFactory = {
  inject: [ConfigService],
  global: true,
  useFactory: async (configService: ConfigService) => {
    return {
      secret: configService.getOrThrow(EnvVariable.JWT_SECRET),
      signOptions: {
        expiresIn: configService.getOrThrow(EnvVariable.NODE_ENV) === "production" ? "1d" : "10d"
      }
    };
  }
};

@Global()
@Module({
  imports: [JwtModule.registerAsync(jwtFactory)],
  providers: [{ provide: AbstractAuthService, useClass: AuthService }],
  exports: [AbstractAuthService]
})
export class AuthModule {}
