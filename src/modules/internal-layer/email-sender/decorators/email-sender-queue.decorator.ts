import { InjectQueue } from "@nestjs/bullmq";
import { ACCOUNT_VERIFICATION_EMAIL_SENDER_QUEUE } from "../../../../shared/constants/bullmq-queue-names.constant";

export function EmailSenderQueue(): ParameterDecorator {
  return InjectQueue(ACCOUNT_VERIFICATION_EMAIL_SENDER_QUEUE);
}
