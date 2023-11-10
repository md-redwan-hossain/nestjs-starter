import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";
import { LevelOfLog } from "../../../../shared/enums/level-of-log.enum";

@Schema({ collection: "error_logs" })
export class Logging {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ type: String, required: true, enum: Object.keys(LevelOfLog) })
  level: LevelOfLog;

  @Prop({ required: true })
  message: string;

  @Prop()
  context?: string;

  @Prop()
  stack_trace?: string;
}

export const LoggingSchema = SchemaFactory.createForClass(Logging);

export type LoggingDocument = HydratedDocument<Logging>;
