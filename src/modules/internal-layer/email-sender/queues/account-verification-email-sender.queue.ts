import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Job } from "bullmq";
import { MailgunMessageData, MailgunService } from "nestjs-mailgun";
import { ACCOUNT_VERIFICATION_EMAIL_SENDER_QUEUE } from "../../../../shared/constants/bullmq-queue-names.constant";
import { EnvVariable } from "../../../../shared/enums/env-variable.enum";

@Processor(ACCOUNT_VERIFICATION_EMAIL_SENDER_QUEUE)
export class AccountVerificationEmailSenderQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(AccountVerificationEmailSenderQueueProcessor.name);
  constructor(
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService
  ) {
    super();
  }

  async process(job: Job<any, any, string>, token?: string | undefined): Promise<any> {
    const domain = this.configService.getOrThrow(EnvVariable.MAILGUN_DOMAIN);
    const orgName = this.configService.getOrThrow(EnvVariable.MAILGUN_DOMAIN);
    const orgEmail = this.configService.getOrThrow(EnvVariable.COMPANY_EMAIL);
    const [receiverEmail] = job.name.split(" ");

    const data: MailgunMessageData = {
      from: `${orgName} <${orgEmail}>`,
      to: `${receiverEmail}`,
      subject: "Account Verification",
      html: `<h5> Use the code to active your account: ${job.data} </h5>`
    };
    await this.mailgunService.createEmail(domain, data);
  }

  @OnWorkerEvent("failed")
  onActive(job: Job) {
    this.logger.error(
      "email sending failed",
      job,
      AccountVerificationEmailSenderQueueProcessor.name
    );
  }
}
