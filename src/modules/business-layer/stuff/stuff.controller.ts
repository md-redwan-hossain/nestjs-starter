import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  ValidationPipe
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import ms from "ms";
import { defaultValidationPipeRules } from "../../../shared/constants/default-validation-pipe-rules.constant";
import { JwtRbacAuth } from "../../../shared/decorators/jwt-rbac-auth.decorator";
import { UserId } from "../../../shared/decorators/user-id.decorator";
import { USER_ROLE } from "../../../shared/enums/user-role.enum";
import { DisallowSameOldAndNewPasswordPipe } from "../../../shared/pipes/disallow-same-old-and-new-password.pipe";
import { AbstractJwtAuthService } from "../../internal-layer/auth/abstracts/jwt-auth.abstract";
import { AccountVerificationDto } from "../../internal-layer/auth/dto/account-verification.dto";
import { EmailLoginDto } from "../../internal-layer/auth/dto/login.dto";
import { ChangePasswordDto } from "../../internal-layer/auth/dto/password-change.dto";
import {
  TwoFactorAuthenticationDto,
  TwoFactorAuthenticationWithRecoveryCodeDto
} from "../../internal-layer/auth/dto/two-factor-authentication.dto";
import { CreateStuffDto } from "./dto/create-stuff.dto";
import { ResponseStuffDto, TotpResponseDTo } from "./dto/response-stuff.dto";
import { UpdateStuffDto } from "./dto/update-stuff.dto";
import { StuffAuthRepository } from "./stuff-auth.repository";
import { StuffCrudRepository } from "./stuff-crud.repository";
import { StuffService } from "./stuff.service";

@ApiTags("stuff")
@ApiConsumes("application/json")
@ApiProduces("application/json")
@Controller("stuff")
export class StuffController {
  constructor(
    private readonly stuffService: StuffService,
    private readonly crudRepo: StuffCrudRepository,
    private readonly authRepo: StuffAuthRepository,
    private readonly jwtAuthService: AbstractJwtAuthService
  ) {}

  @Post("signup")
  @ApiOperation({ summary: "stuff Signup" })
  @ApiCreatedResponse({ type: ResponseStuffDto })
  @ApiBadRequestResponse()
  async create(
    @Body(new ValidationPipe(defaultValidationPipeRules)) createStuffDto: CreateStuffDto,
    @Res() response: Response
  ) {
    const entity = await this.crudRepo.create(createStuffDto);
    if (!entity) return response.status(HttpStatus.BAD_REQUEST).end();
    response.status(HttpStatus.CREATED).send(new ResponseStuffDto(entity)).end();
  }

  @JwtRbacAuth([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @Get("profile")
  @ApiOperation({ summary: "stuff profile" })
  @ApiOkResponse({ type: ResponseStuffDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async findOne(@UserId() id: string, @Res() response: Response) {
    const entity = await this.crudRepo.findOneById(id);
    if (!entity) return response.status(HttpStatus.NOT_FOUND).end();
    if (!entity.IsVerified) throw new ForbiddenException("entity not verified");
    response.status(HttpStatus.OK).send(new ResponseStuffDto(entity));
  }

  @JwtRbacAuth([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @Patch("profile")
  @ApiOperation({ summary: "Update stuff data" })
  @ApiOkResponse({ type: ResponseStuffDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async update(
    @Body(new ValidationPipe(defaultValidationPipeRules)) dto: UpdateStuffDto,
    @UserId() id: string,
    @Res() response: Response
  ) {
    if (Object.keys(dto).length === 0) return response.status(HttpStatus.NOT_MODIFIED).end();

    const entity = await this.crudRepo.findOneById(id);
    if (!entity) return response.status(HttpStatus.NOT_FOUND).end();

    if (!entity.IsVerified) throw new ForbiddenException("entity not verified");

    const updatedData = await this.crudRepo.update(entity.Id, dto);
    if (!updatedData) return response.status(HttpStatus.BAD_REQUEST).end();
    response.status(HttpStatus.OK).send(new ResponseStuffDto(updatedData));
  }

  @Post("add-2fa")
  @ApiOperation({ summary: "stuff add 2fa" })
  @ApiCreatedResponse({ type: TotpResponseDTo })
  @ApiBadRequestResponse()
  async confirm2fa(
    @Body(new ValidationPipe(defaultValidationPipeRules)) dto: EmailLoginDto,
    @Res() response: Response
  ) {
    const data = await this.stuffService.create2faData(dto);
    if (!data) return response.status(HttpStatus.BAD_REQUEST).end();

    response
      .status(HttpStatus.CREATED)
      .json({
        AuthenticatorKey: data.encryptedKey,
        RecoveryCodes: data.encryptedRecoveryCodes,
        Url: data.url
      })
      .end();
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
    const entity = await this.stuffService.validate2faLogin(twoFactorDto);
    if (!entity) return response.status(HttpStatus.UNAUTHORIZED).end();

    const access_token = await this.jwtAuthService.issueJsonWebToken(
      entity.Id,
      USER_ROLE.MODERATOR
    );
    response.set({ access_token }).status(HttpStatus.OK).json({ message: "login Ok" }).end();
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
    const entity = await this.stuffService.validateLoginWithRecoveryCode(twoFactorRecoveryCodeDto);
    if (entity) {
      const access_token = await this.jwtAuthService.issueJsonWebToken(
        entity.Id,
        USER_ROLE.MODERATOR
      );
      response.set({ access_token }).status(HttpStatus.OK).json({ message: "login Ok" }).end();
    } else response.status(HttpStatus.UNAUTHORIZED).end();
  }

  @JwtRbacAuth([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @Post("logout")
  @ApiOperation({ summary: "stuff logout" })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  async logout(@Req() request: Request, @Res() response: Response) {
    await this.jwtAuthService.blacklistTokenOnLogout(
      request?.jwt as string,
      request?.user?.exp as string
    );
    response.status(HttpStatus.OK).json({ message: "logout Ok" }).end();
  }

  @JwtRbacAuth([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @Throttle({ default: { limit: 3, ttl: ms("1m") } })
  @Post("verify")
  @ApiOperation({ summary: "stuff account verify" })
  @ApiOkResponse()
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

  @JwtRbacAuth([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @Post("resend-account-verification-code")
  @Throttle({ default: { limit: 1, ttl: ms("30m") } })
  @ApiOperation({ summary: "resend account verification code" })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  async resendAccountVerificationCode(@UserId() id: string, @Res() response: Response) {
    const data = await this.stuffService.resendVerificationCode(id);
    if (!data) return response.status(HttpStatus.BAD_REQUEST).end();
    response.status(HttpStatus.OK).end();
  }

  @JwtRbacAuth([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
  @Post("change-password")
  @ApiOperation({ summary: "change password for stuff" })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  async resetPassword(
    @Body(new ValidationPipe(defaultValidationPipeRules), DisallowSameOldAndNewPasswordPipe)
    changePasswordDto: ChangePasswordDto,
    @UserId() id: string,
    @Res() response: Response
  ) {
    const status = await this.stuffService.changePassword(id, changePasswordDto);
    if (status) response.status(HttpStatus.OK).end();
    else response.status(HttpStatus.BAD_REQUEST).end();
  }
}
