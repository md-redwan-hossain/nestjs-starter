import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModuleOptions, JwtOptionsFactory } from "@nestjs/jwt";
import { EnvVariable } from "../shared/enums/env-variable.enum";

@Injectable()
export class JwtModuleConfig implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createJwtOptions(): JwtModuleOptions | Promise<JwtModuleOptions> {
    return {
      secret: this.configService.getOrThrow(EnvVariable.JWT_SECRET),
      signOptions: {
        expiresIn:
          this.configService.getOrThrow(EnvVariable.NODE_ENV) === "production" ? "1d" : "10d"
      }
    };
  }
}
