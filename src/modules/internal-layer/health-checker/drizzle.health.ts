import { Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DrizzleQueryBuilderSyntax } from "../../data-layer/drizzle.decorator";

@Injectable()
export class DrizzleHealthIndicator extends HealthIndicator {
  constructor(@DrizzleQueryBuilderSyntax() private readonly db: PostgresJsDatabase) {
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
