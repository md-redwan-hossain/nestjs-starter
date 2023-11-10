import { UUID } from "crypto";

export abstract class AbstractEmailSenderService {
  abstract addTaskInEmailQueue(id: string | UUID, email: string): Promise<boolean>;
}
