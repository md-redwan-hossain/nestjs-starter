import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class DisallowEmptyArrayPipe implements PipeTransform {
  transform(value: any) {
    if (!Array.isArray(value)) {
      throw new BadRequestException("Request body is not a valid array");
    }

    if (value.length === 0) {
      throw new BadRequestException("Array cannot be empty");
    }

    return value;
  }
}
