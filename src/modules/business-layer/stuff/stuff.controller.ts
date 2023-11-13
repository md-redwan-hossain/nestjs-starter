import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request, Response, request } from "express";
import ms from "ms";
import { defaultValidationPipeRules } from "../../../shared/constants/default-validation-pipe-rules.constant";
import { JwtRbacAuth } from "../../../shared/decorators/jwt-rbac-auth.decorator";
import { UserId } from "../../../shared/decorators/user-id.decorator";
import { USER_ROLE } from "../../../shared/enums/user-role.enum";
import { DisallowSameOldAndNewPasswordPipe } from "../../../shared/pipes/disallow-same-old-and-new-password.pipe";
import { AllowedRoles } from "../../internal-layer/auth/decorators/allowed-roles.decorator";
import { AccountVerificationDto } from "../../internal-layer/auth/dto/account-verification.dto";
import { ChangePasswordDto } from "../../internal-layer/auth/dto/password-change.dto";
import {
  TwoFactorAuthenticationDto,
  TwoFactorAuthenticationWithRecoveryCodeDto
} from "../../internal-layer/auth/dto/two-factor-authentication.dto";
import { JwtAuthGuard } from "../../internal-layer/auth/guards/jwt-auth.guard";
import { RoleGuard } from "../../internal-layer/auth/guards/role.guard";
import { CreateStuffDto } from "./dto/create-stuff.dto";
import { ResponseStuff2faDto, ResponseStuffDto } from "./dto/response-stuff.dto";
import { UpdateStuffDto } from "./dto/update-stuff.dto";
import { StuffService } from "./stuff.service";

@ApiTags("stuff")
@ApiConsumes("application/json")
@ApiProduces("application/json")
@Controller("stuff")
export class StuffController {
  constructor(private readonly stuffService: StuffService) {}

  @Post("signup")
  @ApiOperation({ summary: "stuff Signup" })
  @ApiCreatedResponse({ type: ResponseStuff2faDto })
  @ApiBadRequestResponse()
  async create(
    @Body(new ValidationPipe(defaultValidationPipeRules)) createStuffDto: CreateStuffDto,
    @Res() response: Response
  ) {
    const stuff = await this.stuffService.create(createStuffDto);
    if (stuff) {
      response
        .status(HttpStatus.CREATED)
        .json({
          Entity: new ResponseStuffDto(stuff.Entity),
          Totp: {
            AuthenticatorKey: stuff.Entity.AuthenticatorKey,
            RecoveryCodes: stuff.Entity.RecoveryCodes,
            Url: stuff.TotpData.url.replace(stuff.TotpData.secret, "placeholder")
          }
        })
        .end();
    } else response.status(HttpStatus.BAD_REQUEST).end();
  }

  @Post("2fa-login")
  @ApiOperation({ summary: "stuff Login with 2fa token" })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  async login2fa(
    @Body(new ValidationPipe(defaultValidationPipeRules)) twoFactorDto: TwoFactorAuthenticationDto,
    @Res() response: Response
  ) {
    const stuff = await this.stuffService.validateLogin(twoFactorDto);
    if (stuff) {
      const { access_token } = await this.stuffService.jwtIssuer(stuff);
      response.set({ access_token }).status(HttpStatus.OK).json({ message: "login Ok" }).end();
    } else response.status(HttpStatus.UNAUTHORIZED).end();
  }

  @Post("2fa-recovery-code-login")
  @ApiOperation({ summary: "stuff Login with 2fa recovery code" })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  async login(
    @Body(new ValidationPipe(defaultValidationPipeRules))
    twoFactorRecoveryCodeDto: TwoFactorAuthenticationWithRecoveryCodeDto,
    @Res() response: Response
  ) {
    const stuff = await this.stuffService.validateLoginWithRecoveryCode(twoFactorRecoveryCodeDto);
    if (stuff) {
      const { access_token } = await this.stuffService.jwtIssuer(stuff);
      response.set({ access_token }).status(HttpStatus.OK).json({ message: "login Ok" }).end();
    } else response.status(HttpStatus.UNAUTHORIZED).end();
  }

  @AllowedRoles([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @ApiBearerAuth()
  @ApiOperation({ summary: "stuff logout" })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  async logout(@Req() request: Request, @Res() response: Response) {
    const status = await this.stuffService.logout(
      request?.jwt as string,
      request?.user?.exp as string
    );
    if (status) response.status(HttpStatus.OK).json({ message: "logout Ok" }).end();
    else response.status(HttpStatus.UNAUTHORIZED).end();
  }

  @AllowedRoles([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: ms("1m") } })
  @Post("verify")
  @ApiBearerAuth()
  @ApiOperation({ summary: "stuff account verify" })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  async verifyAccount(
    @Body(new ValidationPipe(defaultValidationPipeRules))
    accountVerificationDto: AccountVerificationDto,
    @UserId() id: string,
    @Res() response: Response
  ) {
    const status = await this.stuffService.verifyAccount(accountVerificationDto, id);
    if (status) response.status(HttpStatus.OK).json({ message: "successfully verified" }).end();
    else response.status(HttpStatus.UNAUTHORIZED).end();
  }

  @AllowedRoles([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @ApiBearerAuth()
  @ApiOperation({ summary: "change password for stuff" })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async changePassword(
    @Body(new ValidationPipe(defaultValidationPipeRules), DisallowSameOldAndNewPasswordPipe)
    changePasswordDto: ChangePasswordDto,
    @UserId() id: string,
    @Res() response: Response
  ) {
    const status = await this.stuffService.changePassword(id, changePasswordDto);
    if (status) response.status(HttpStatus.OK).end();
    else response.status(HttpStatus.BAD_REQUEST).end();
  }

  @JwtRbacAuth([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @Get("profile")
  @ApiOperation({ summary: "stuff profile" })
  @ApiOkResponse({ type: ResponseStuffDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async findOne(@UserId() id: string, @Res() response: Response) {
    const stuff = await this.stuffService.findOneById(id);
    if (!stuff) {
      return response.status(HttpStatus.NOT_FOUND).end();
    }

    if (stuff.IsDeactivated) {
      return response.status(HttpStatus.BAD_REQUEST).send("Account is not activated");
    }

    response.status(HttpStatus.OK).send(new ResponseStuffDto(stuff));
  }

  @AllowedRoles([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update stuff data" })
  @ApiOkResponse({ type: ResponseStuffDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async update(
    @Body(new ValidationPipe(defaultValidationPipeRules)) updateStuffDto: UpdateStuffDto,
    @UserId() id: string,
    @Res() response: Response
  ) {
    if (Object.keys(updateStuffDto).length === 0) {
      return response.status(HttpStatus.NOT_MODIFIED).end();
    }

    const stuff = await this.stuffService.findOneById(id);
    if (!stuff) return response.status(HttpStatus.NOT_FOUND).end();

    if (stuff.IsDeactivated) {
      return response.status(HttpStatus.BAD_REQUEST).send("Account is not activated");
    }

    const updatedData = await this.stuffService.update(stuff.Id, updateStuffDto);
    if (updatedData) response.status(HttpStatus.OK).send(new ResponseStuffDto(updatedData));
    else response.status(HttpStatus.BAD_REQUEST).end();
  }

  @AllowedRoles([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Delete("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete stuff" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async remove(@UserId() id: string, @Res() response: Response) {
    const stuff = await this.stuffService.findOneById(id);
    if (!stuff) return response.status(HttpStatus.NOT_FOUND).end();

    if (stuff.IsDeactivated) {
      return response.status(HttpStatus.BAD_REQUEST).send("Account is not activated");
    }

    const status = await this.stuffService.remove(request?.user?.Id as string);
    if (status) response.status(HttpStatus.NO_CONTENT).end();
    else response.status(HttpStatus.NOT_FOUND).end();
  }
}
