import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailgunModule } from "nestjs-mailgun";
import { ACCOUNT_VERIFICATION_EMAIL_SENDER_QUEUE } from "../../../shared/constants/bullmq-queue-names.constant";
import { EnvVariable } from "../../../shared/enums/env-variable.enum";
import { AbstractEmailSenderService } from "./abstracts/email-sender.abstract";
import { EmailSenderService } from "./email-sender.service";
import { AccountVerificationEmailSenderQueueProcessor } from "./queues/account-verification-email-sender.queue";

@Module({
  imports: [
    MailgunModule.forAsyncRoot({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          username: "api",
          key: configService.getOrThrow(EnvVariable.MAILGUN_API_KEY)
        };
      }
    }),

    BullModule.registerQueue({ name: ACCOUNT_VERIFICATION_EMAIL_SENDER_QUEUE }),
    // BullBoardModule.forFeature({
    //   name: ACCOUNT_VERIFICATION_EMAIL_SENDER_QUEUE,
    //   adapter: BullMQAdapter
    // })
  ],
  providers: [
    { provide: AbstractEmailSenderService, useClass: EmailSenderService },
    AccountVerificationEmailSenderQueueProcessor
  ],
  exports: [AbstractEmailSenderService]
})
export class EmailSenderModule {}
