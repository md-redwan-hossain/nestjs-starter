import { Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { sql } from "drizzle-orm";
import { InjectDrizzle } from "../../data-layer/drizzle.decorator";
import { DrizzlePg } from "../../data-layer/drizzle/types";

@Injectable()
export class DrizzleHealthIndicator extends HealthIndicator {
  constructor(@InjectDrizzle() private readonly db: DrizzlePg) {
    super();
  }

  private async pingDb(): Promise<boolean> {
    const status: Array<{ ping: number }> = await this.db.execute(sql<number>`select 1 as ping`);
    return Array.isArray(status) && status.length > 0 && status[0].ping === 1;
  }

  async pingCheck(): Promise<HealthIndicatorResult> {
    const isDbAlive = await this.pingDb();
    const result = this.getStatus("databaseStatus", isDbAlive);

    if (isDbAlive) return result;
    throw new HealthCheckError("Database check failed", result);
  }
}
