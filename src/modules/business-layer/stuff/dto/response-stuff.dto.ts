import { ApiResponseProperty } from "@nestjs/swagger";
import { GENDER } from "../../../../shared/enums/gender.enum";
import { ReadStuff } from "../../../data-layer/drizzle/types";

export class ResponseStuffDto {
  @ApiResponseProperty()
  Id: string;

  @ApiResponseProperty()
  FullName: string;

  @ApiResponseProperty()
  Email: string;

  @ApiResponseProperty()
  MobileNumber?: string;

  @ApiResponseProperty()
  Bio?: string;

  @ApiResponseProperty({ enum: Object.keys(GENDER) })
  Gender: GENDER;

  @ApiResponseProperty()
  DateOfBirth: string;

  constructor(stuff: ReadStuff) {
    this.Id = stuff.Id;
    this.FullName = stuff.FullName;
    this.Email = stuff.Email;
    this.MobileNumber = stuff.MobileNumber || undefined;
    this.Bio = stuff.Bio || undefined;
    this.Gender = stuff.Gender as GENDER;
    this.DateOfBirth = stuff.DateOfBirth;
  }
}

export class TotpResponseDTo {
  @ApiResponseProperty()
  AuthenticatorKey: string;

  @ApiResponseProperty()
  RecoveryCodes: string;

  @ApiResponseProperty()
  Url: string;
}
