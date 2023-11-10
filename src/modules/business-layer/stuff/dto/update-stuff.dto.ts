import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateStuffDto } from "./create-stuff.dto";

export class UpdateStuffDto extends PartialType(OmitType(CreateStuffDto, ["Password"])) {}
