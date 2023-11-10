import { Module } from "@nestjs/common";
import { AbstractEmailSenderService } from "../../internal-layer/email-sender/abstracts/email-sender.abstract";
import { StuffController } from "./stuff.controller";
import { StuffService } from "./stuff.service";
import { EmailSenderModule } from "../../internal-layer/email-sender/email-sender.module";

@Module({
  controllers: [StuffController],
  providers: [StuffService],
  imports: [EmailSenderModule]
})
export class StuffModule {}
