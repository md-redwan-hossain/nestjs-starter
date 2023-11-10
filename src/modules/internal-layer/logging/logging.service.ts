import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import dayjs from "dayjs";
import { Model } from "mongoose";
import { TimeFormat } from "../../../shared/enums/time-format.enum";
import { calculatePagination } from "../../../shared/utils/helpers/calculate-pagination";
import { QueryLoggingDto } from "./dto/query-logging.dto";
import { Logging, LoggingDocument } from "./enitities/logging.entity";

@Injectable()
export class LoggingService {
  constructor(@InjectModel(Logging.name) private loggingModel: Model<LoggingDocument>) {}

  async getAllLogs(queryParam: QueryLoggingDto) {
    const query = this.loggingModel
      .find()
      .select({ __v: false })
      .sort({ timestamp: -1 })
      .skip(calculatePagination(queryParam.Page, queryParam.Limit))
      .limit(queryParam.Limit);

    if (queryParam.level) query.where("level").in(queryParam.level);

    let parsedTime: string = "";

    if (queryParam.date && queryParam.time) {
      parsedTime = dayjs(`${queryParam.date} ${queryParam.time}`, [
        TimeFormat.YEAR_MONTH_DATE,
        TimeFormat.HOUR_MINUTE_AM_OR_PM
      ]).toISOString();
    } else if (queryParam.date && !queryParam.time) {
      parsedTime = dayjs(`${queryParam.date}`, TimeFormat.YEAR_MONTH_DATE).toISOString();
    }

    if (parsedTime) {
      if (queryParam.inverse_datetime) {
        query.lte<string>("timestamp", parsedTime);
      } else {
        query.gte<string>("timestamp", parsedTime);
      }
    }

    return await query.exec();
  }
}
