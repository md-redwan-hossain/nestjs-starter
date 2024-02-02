import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { EnvVariable } from "../../../../shared/enums/env-variable.enum";
import { InjectJwtAuthService } from "../decorators/auth.decorator";
import { IJwtAuthService } from "../interfaces/jwt-auth.interface";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectJwtAuthService() private readonly jwtAuthService: IJwtAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("access_token is missing in header");
    }

    const payload: {
      Id: string;
      Role: string;
      Env: string;
      iat: string;
      exp: string;
    } = await this.jwtService.verifyAsync(token, {
      secret: this.configService.getOrThrow(EnvVariable.JWT_SECRET)
    });

    const envInRequest = payload?.Env;

    if (this.configService.getOrThrow(EnvVariable.NODE_ENV) !== envInRequest) {
      throw new UnauthorizedException("mismatch in token Env");
    }

    const blackListStatus = await this.jwtAuthService.tokenBlacklistedStatus(token);
    if (blackListStatus) throw new UnauthorizedException("access_token is blacklisted");

    Object.assign(request, { user: payload });
    Object.assign(request, { jwt: token });

    return true;
  }
}
