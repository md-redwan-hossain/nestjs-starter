import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { AuthModule } from "../../internal-layer/auth/auth.module";
import { DrizzleHealthIndicator } from "./drizzle.health";
import { HealthCheckerController } from "./health-checker.controller";

@Module({
  controllers: [HealthCheckerController],
  providers: [DrizzleHealthIndicator],
  imports: [TerminusModule, HttpModule, AuthModule]
})
export class HealthCheckerModule {}
