import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";
import { Cache } from "cache-manager";
import { UUID } from "crypto";
import { EnvVariable } from "../../../shared/enums/env-variable.enum";
import { ReadStuff, StuffEntity } from "../../data-layer/drizzle/types";
import { AbstractTwoFactorAuthService } from "../../internal-layer/auth/abstracts/two-factor-auth.abstract";
import { AccountVerificationDto } from "../../internal-layer/auth/dto/account-verification.dto";
import { EmailLoginDto } from "../../internal-layer/auth/dto/login.dto";
import { ChangePasswordDto } from "../../internal-layer/auth/dto/password-change.dto";
import {
  TwoFactorAuthenticationDto,
  TwoFactorAuthenticationWithRecoveryCodeDto
} from "../../internal-layer/auth/dto/two-factor-authentication.dto";
import { AbstractEmailSenderService } from "../../internal-layer/email-sender/abstracts/email-sender.abstract";
import { accountActivationTokenPrefix } from "../../internal-layer/email-sender/constants";
import { UpdateStuffDto } from "./dto/update-stuff.dto";
import { StuffAuthRepository } from "./stuff-auth.repository";
import { StuffCrudRepository } from "./stuff-crud.repository";
import { InjectStuffEntity } from "./stuff.decorator";
import { currentLocalTimeStamp } from "../../../shared/utils/helpers/current-local-timestamp";

@Injectable()
export class StuffService {
  constructor(
    @InjectStuffEntity() readonly entity: StuffEntity,
    private readonly twoFactorAuthService: AbstractTwoFactorAuthService,
    private readonly emailSenderService: AbstractEmailSenderService,
    private readonly configService: ConfigService,
    private readonly authRepo: StuffAuthRepository,
    private readonly crudRepo: StuffCrudRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create2faData(dto: EmailLoginDto) {
    const retrivedEntity = await this.authRepo.validateEmailLogin(dto);
    if (!retrivedEntity) return null;

    if (retrivedEntity.IsTwoFactorAuthConfirmed)
      throw new BadRequestException("2fa is alreadyactivated");

    const totpData = await this.twoFactorAuthService.generateTotpKey({
      issuer: this.configService.getOrThrow(EnvVariable.COMPANY_NAME),
      user: dto.Email
    });

    const plainRecoveryCodes = await this.twoFactorAuthService.generateRecoveryCodesForTotpAuth();

    const hashedRecoveryCodes =
      await this.twoFactorAuthService.hashRecoveryCodesForTotpAuth(plainRecoveryCodes);

    const encryptedRecoveryCodes = await this.twoFactorAuthService.encryptRecoveryCodesForTotpAuth(
      plainRecoveryCodes,
      dto.Password
    );

    const encryptedKey = await this.twoFactorAuthService.encryptTotpKey(
      totpData.secret,
      dto.Password
    );

    const status = await this.authRepo.create2faData(
      retrivedEntity.Id,
      encryptedKey,
      hashedRecoveryCodes
    );

    if (!status?.Id) return null;

    return {
      encryptedKey,
      encryptedRecoveryCodes,
      url: totpData.url.replace(totpData.secret, "placeholder")
    };
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const retrivedEntity = await this.crudRepo.findOneById(id);
    if (!retrivedEntity) throw new NotFoundException("No Stuff found with the given Id");

    const isValidPassword = await bcrypt.compare(dto.OldPassword, retrivedEntity.Password);
    if (!isValidPassword) throw new BadRequestException("Invalid OldPassword");

    if (!retrivedEntity.IsVerified) throw new ForbiddenException("entity not verified");

    dto.NewPassword = await bcrypt.hash(dto.NewPassword, 8);

    const dataForUpdate = new UpdateStuffDto({
      Password: dto.NewPassword,
      UpdatedAt: currentLocalTimeStamp()
    });

    if (retrivedEntity.AuthenticatorKey) {
      const newEncrypted2faSecret = await this.twoFactorAuthService.reEncryptTotpKey(
        dto.OldPassword,
        dto.NewPassword,
        retrivedEntity.AuthenticatorKey
      );
      Object.assign(dataForUpdate, { AuthenticatorKey: newEncrypted2faSecret });
    }

    const updatedEntity = await this.crudRepo.update(retrivedEntity.Id, dataForUpdate);
    return updatedEntity?.Id ? true : false;
  }

  async validate2faLogin(dto: TwoFactorAuthenticationDto): Promise<ReadStuff | null> {
    const retrivedEntity = await this.authRepo.validateEmailLogin(dto);
    if (!retrivedEntity) return null;

    if (!retrivedEntity.IsTwoFactorAuthConfirmed || !retrivedEntity.AuthenticatorKey)
      throw new ForbiddenException("2fa is not activated");

    const isValidTotp = await this.twoFactorAuthService.verifyEncryptedTotp(
      retrivedEntity.AuthenticatorKey,
      dto.Token,
      dto.Password
    );
    if (!isValidTotp) return null;

    if (!retrivedEntity.IsTwoFactorAuthConfirmed) {
      await this.authRepo.update2faStatus(retrivedEntity.Id);
      if (!retrivedEntity.IsVerified) {
        await this.emailSenderService.addTaskInEmailQueue(retrivedEntity.Id, retrivedEntity.Email);
      }
    }

    return retrivedEntity;
  }

  async validateLoginWithRecoveryCode(
    dto: TwoFactorAuthenticationWithRecoveryCodeDto
  ): Promise<ReadStuff | null> {
    const retrivedEntity = await this.authRepo.validateEmailLogin(dto);
    if (!retrivedEntity) return null;

    if (!retrivedEntity.IsTwoFactorAuthConfirmed || !retrivedEntity.RecoveryCodes)
      throw new ForbiddenException("2fa is not activated");

    let indexOfMatchedCode: number = -1;

    for (const [index, val] of retrivedEntity.RecoveryCodes.entries()) {
      const isMatched = await bcrypt.compare(dto.RecoveryCode, val);
      if (isMatched) {
        indexOfMatchedCode = index;
        break;
      }
    }

    if (indexOfMatchedCode >= 0 && indexOfMatchedCode < retrivedEntity.RecoveryCodes.length) {
      retrivedEntity.RecoveryCodes.splice(indexOfMatchedCode, 1);
      const status = await this.authRepo.removeUsedRecoveryCode(
        retrivedEntity.Id,
        retrivedEntity.RecoveryCodes
      );
      return status?.Id ? retrivedEntity : null;
    } else return null;
  }

  async verifyAccount(dto: AccountVerificationDto, id: string | UUID): Promise<boolean> {
    const key = accountActivationTokenPrefix.concat(id);
    const tokenInCache = await this.cacheManager.get<string>(key);
    if (!tokenInCache || tokenInCache !== dto.Token) return false;

    const entity = await this.crudRepo.findOneById(id);
    if (!entity?.Id) throw new BadRequestException("No entity found with the given Id");
    if (entity.IsVerified) throw new BadRequestException("Already verified");
    const status = this.authRepo.updateAccountVerificationStatus(dto, id);
    await this.cacheManager.del(key);
    return status;
  }

  async resendVerificationCode(id: string): Promise<boolean> {
    const retrivedEntity = await this.crudRepo.findOneById(id);
    if (!retrivedEntity) throw new NotFoundException("entity not found");

    if (retrivedEntity.IsVerified) throw new BadRequestException("already verified");

    const key = accountActivationTokenPrefix.concat(retrivedEntity.Id);
    const tokenInCache = await this.cacheManager.get<string>(key);
    if (tokenInCache) throw new BadRequestException("old token already exists");

    return await this.emailSenderService.addTaskInEmailQueue(
      retrivedEntity.Id,
      retrivedEntity.Email
    );
  }
}
