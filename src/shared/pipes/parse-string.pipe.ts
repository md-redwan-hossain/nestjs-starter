import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseStringPipe implements PipeTransform {
  transform(value: any) {
    let trimmedData: string;
    if (typeof value === "string") {
      trimmedData = value.trim();
      if (trimmedData.length === 0) {
        throw new BadRequestException("string cannot be empty");
      }
    } else throw new BadRequestException("value is not valid string");
    return trimmedData;
  }
}
