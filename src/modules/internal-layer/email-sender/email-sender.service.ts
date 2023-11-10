import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { Cache } from "cache-manager";
import ms from "ms";
import { uid } from "uid/secure";
import { AbstractEmailSenderService } from "./abstracts/email-sender.abstract";
import { accountActivationTokenPrefix } from "./constants";
import { EmailSenderQueue } from "./decorators/email-sender-queue.decorator";

@Injectable()
export class EmailSenderService implements AbstractEmailSenderService {
  constructor(
    @EmailSenderQueue() private readonly emailSenderQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async addTaskInEmailQueue(id: string, email: string): Promise<boolean> {
    const token = uid();
    await this.cacheManager.set(accountActivationTokenPrefix.concat(id), token, ms("30m"));
    await this.emailSenderQueue.add(`${email} ${id}`, token, {
      removeOnComplete: { age: ms("30d") / 1000, count: 100 },
      removeOnFail: { age: ms("7d") / 1000 }
    });
    return true;
  }
}
