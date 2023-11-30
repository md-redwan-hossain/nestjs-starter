import { Module } from "@nestjs/common";
import { Stuffs } from "../../data-layer/drizzle/schema";
import { EmailSenderModule } from "../../internal-layer/email-sender/email-sender.module";
import { StuffAuthRepository } from "./stuff-auth.repository";
import { StuffCrudRepository } from "./stuff-crud.repository";
import { StuffController } from "./stuff.controller";
import { STUFF_DI_TOKEN } from "./stuff.decorator";
import { StuffService } from "./stuff.service";

@Module({
  controllers: [StuffController],
  providers: [
    StuffCrudRepository,
    StuffAuthRepository,
    StuffService,
    { provide: STUFF_DI_TOKEN, useValue: Stuffs }
  ],
  imports: [EmailSenderModule]
})
export class StuffModule {}
