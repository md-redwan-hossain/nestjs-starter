import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";
import { Cache } from "cache-manager";
import { UUID } from "crypto";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { ValidTotpConfig } from "time2fa/index";
import { ulid } from "ulid";
import { ULIDtoUUID } from "ulid-uuid-converter";
import { EnvVariable } from "../../../shared/enums/env-variable.enum";
import { USER_ROLE } from "../../../shared/enums/user-role.enum";
import { relationalSchema } from "../../data-layer/drizzle";
import { DrizzleOrmSyntax, DrizzleQueryBuilderSyntax } from "../../data-layer/drizzle.decorator";
import { Stuffs } from "../../data-layer/drizzle/schema";
import { AbstractAuthService } from "../../internal-layer/auth/abstracts/auth.abstract";
import { AccountVerificationDto } from "../../internal-layer/auth/dto/account-verification.dto";
import { ChangePasswordDto } from "../../internal-layer/auth/dto/password-change.dto";
import {
  TwoFactorAuthenticationDto,
  TwoFactorAuthenticationWithRecoveryCodeDto
} from "../../internal-layer/auth/dto/two-factor-authentication.dto";
import { AbstractEmailSenderService } from "../../internal-layer/email-sender/abstracts/email-sender.abstract";
import { accountActivationTokenPrefix } from "../../internal-layer/email-sender/constants";
import { CreateStuffDto } from "./dto/create-stuff.dto";
import { UpdateStuffDto } from "./dto/update-stuff.dto";

@Injectable()
export class StuffService {
  constructor(
    @DrizzleQueryBuilderSyntax() private readonly db: PostgresJsDatabase,
    @DrizzleOrmSyntax() private readonly dbOrm: PostgresJsDatabase<typeof relationalSchema>,
    private readonly authService: AbstractAuthService,
    private readonly emailSenderService: AbstractEmailSenderService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createStuffDto: CreateStuffDto): Promise<{
    Entity: typeof Stuffs.$inferSelect;
    TotpData: {
      issuer: string;
      user: string;
      secret: string;
      url: string;
      config: ValidTotpConfig;
    };
  } | null> {
    const passwordBeforeHash = createStuffDto.Password;
    createStuffDto.Password = await bcrypt.hash(createStuffDto.Password, 8);
    const Id = ULIDtoUUID(ulid());
    const totpData = await this.issueTotpSecret(createStuffDto.Email);
    const plainRecoveryCodes = await this.authService.generateRecoveryCodesForTotpAuth();

    const insertStuffData: typeof Stuffs.$inferInsert = {
      Id,
      AuthenticatorKey: await this.authService.encrypt(totpData.secret, passwordBeforeHash),
      RecoveryCodes: await this.authService.hashRecoveryCodesForTotpAuth(plainRecoveryCodes),
      CreatedAt: new Date().toLocaleString(),
      Role: "Moderator",
      ...createStuffDto
    };

    const [data] = await this.db.insert(Stuffs).values(insertStuffData).returning();

    data.RecoveryCodes = await this.authService.encryptRecoveryCodesForTotpAuth(
      plainRecoveryCodes,
      passwordBeforeHash
    );

    if (data?.Id) {
      return { Entity: data, TotpData: totpData };
    } else return null;
  }

  async findOneById(id: string | UUID): Promise<typeof Stuffs.$inferSelect | null> {
    const [data] = await this.db.select().from(Stuffs).where(eq(Stuffs.Id, id));
    return data?.Id ? data : null;
  }

  async findOneByEmail(email: string): Promise<typeof Stuffs.$inferSelect | null> {
    const [data] = await this.db.select().from(Stuffs).where(eq(Stuffs.Email, email));
    return data?.Id ? data : null;
  }

  async checkActivation(id: string | UUID): Promise<typeof Stuffs.$inferSelect> {
    const entity = await this.findOneById(id);
    if (!entity) throw new NotFoundException("No Stuff found with the given Id");
    if (entity.IsDeactivated) throw new BadRequestException("Account is not activated");
    return entity;
  }

  async update(
    id: string | UUID,
    updateStuffDto: UpdateStuffDto
  ): Promise<typeof Stuffs.$inferSelect | null> {
    const [data] = await this.db
      .update(Stuffs)
      .set({ ...updateStuffDto, UpdatedAt: new Date().toLocaleString() })
      .where(eq(Stuffs.Id, id))
      .returning();
    return data?.Id ? data : null;
  }

  async remove(id: string | UUID): Promise<boolean> {
    const [data] = await this.db
      .delete(Stuffs)
      .where(eq(Stuffs.Id, id))
      .returning({ Id: Stuffs.Id });
    if (data?.Id) return true;
    return false;
  }

  private async validatePasswordChange(id: string | UUID, dto: ChangePasswordDto) {
    const stuff = await this.checkActivation(id);
    const isValidPassword = await this.authService.validatePassword(
      stuff.Password,
      dto.OldPassword
    );
    if (!isValidPassword) throw new BadRequestException("Invalid OldPassword");
    if (stuff && isValidPassword) return stuff;
  }

  async reEncrypt2faSecret(dto: ChangePasswordDto, oldEncryptedSecret: string) {
    const oldDecryptedSecret = await this.authService.decrypt(oldEncryptedSecret, dto.OldPassword);
    return await this.authService.encrypt(oldDecryptedSecret, dto.NewPassword);
  }

  async changePassword(id: string | UUID, dto: ChangePasswordDto) {
    const entity = await this.validatePasswordChange(id, dto);
    const newEncrypted2faSecret = await this.reEncrypt2faSecret(
      dto,
      entity?.AuthenticatorKey as string
    );

    dto.NewPassword = await bcrypt.hash(dto.NewPassword, 8);

    const [data] = await this.db
      .update(Stuffs)
      .set({
        Password: dto.NewPassword,
        UpdatedAt: new Date().toLocaleString(),
        AuthenticatorKey: newEncrypted2faSecret
      })
      .where(eq(Stuffs.Id, id))
      .returning();

    return data.Id ? true : false;
  }

  async validateTotp(
    encryptedSecretFromDb: string,
    tokenFromReq: string,
    plainPasswordFromReq: string
  ): Promise<boolean> {
    const decryptedSecret = await this.authService.decrypt(
      encryptedSecretFromDb,
      plainPasswordFromReq
    );
    if (!decryptedSecret) return false;
    return await this.authService.validateTotp(tokenFromReq, decryptedSecret);
  }

  async update2faStatus(id: string | UUID): Promise<typeof Stuffs.$inferSelect | null> {
    const [data] = await this.db
      .update(Stuffs)
      .set({ IsTwoFactorAuthConfirmed: true, UpdatedAt: new Date().toLocaleString() })
      .where(eq(Stuffs.Id, id))
      .returning();
    return data?.Id ? data : null;
  }

  async removeUsedRecoveryCode(
    id: string | UUID,
    updatedCodes: string[]
  ): Promise<typeof Stuffs.$inferSelect | null> {
    const [data] = await this.db
      .update(Stuffs)
      .set({ RecoveryCodes: updatedCodes, UpdatedAt: new Date().toLocaleString() })
      .where(eq(Stuffs.Id, id))
      .returning();
    return data?.Id ? data : null;
  }

  async verifyRole(entity: typeof Stuffs.$inferSelect) {
    const validRoles = [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MODERATOR];
    return validRoles.some((role) => role === entity.Role);
  }

  async validateLogin(
    twoFactorDto: TwoFactorAuthenticationDto
  ): Promise<typeof Stuffs.$inferSelect | null> {
    const stuff = await this.findOneByEmail(twoFactorDto.Email);

    if (!stuff) return null;
    if (!this.verifyRole(stuff)) return null;

    const isValidPassword = await this.authService.validatePassword(
      stuff.Password,
      twoFactorDto.Password
    );
    if (!isValidPassword) return null;
    const isValidTotp = await this.validateTotp(
      stuff.AuthenticatorKey,
      twoFactorDto.Token,
      twoFactorDto.Password
    );

    if (!isValidTotp) return null;
    else {
      if (!stuff.IsTwoFactorAuthConfirmed) {
        const status = await this.update2faStatus(stuff.Id);
        if (!status) return null;
        this.emailSenderService.addTaskInEmailQueue(stuff.Id, stuff.Email);
      }
      return stuff;
    }
  }

  async validateRecoveryCode(stuff: typeof Stuffs.$inferSelect, RecoveryCode: string) {
    for (const item of stuff.RecoveryCodes) {
      const status = await bcrypt.compare(RecoveryCode, item);
      if (status) {
        stuff.RecoveryCodes = stuff.RecoveryCodes.filter((elem) => elem !== item);
        return stuff.RecoveryCodes;
      }
    }
    return null;
  }

  async validateLoginWithRecoveryCode(
    twoFactorRecoveryCodeDto: TwoFactorAuthenticationWithRecoveryCodeDto
  ): Promise<typeof Stuffs.$inferSelect | null> {
    const stuff = await this.findOneByEmail(twoFactorRecoveryCodeDto.Email);
    if (!stuff) return null;

    const isValidPassword = await this.authService.validatePassword(
      stuff.Password,
      twoFactorRecoveryCodeDto.Password
    );
    if (!isValidPassword || !stuff.IsTwoFactorAuthConfirmed) return null;

    const data = await this.validateRecoveryCode(stuff, twoFactorRecoveryCodeDto.RecoveryCode);
    if (!data) return null;
    const status = await this.removeUsedRecoveryCode(stuff.Id, data);
    return status?.Id ? stuff : null;
  }

  async jwtIssuer(stuff: typeof Stuffs.$inferSelect): Promise<{ access_token: string }> {
    return await this.authService.issueJsonWebToken(stuff.Id, USER_ROLE.MODERATOR);
  }

  async logout(token: string, expiresIn: string): Promise<boolean> {
    await this.authService.blacklistTokenOnLogout(token, expiresIn);
    return true;
  }

  async verifyAccount(
    accountVerificationDto: AccountVerificationDto,
    id: string | UUID
  ): Promise<boolean> {
    const key = accountActivationTokenPrefix.concat(id);
    const tokenInCache = await this.cacheManager.get<string>(key);
    if (!tokenInCache || tokenInCache !== accountVerificationDto.Token) return false;

    const entity = await this.findOneById(id);
    if (!entity?.Id) throw new BadRequestException("No entity found with the given Id");
    if (entity.IsVerified) throw new BadRequestException("Already verified");

    await this.db
      .update(Stuffs)
      .set({ IsVerified: true, UpdatedAt: new Date().toLocaleString() })
      .where(eq(Stuffs.Id, id))
      .returning();
    await this.cacheManager.del(key);
    return true;
  }

  async issueTotpSecret(email: string) {
    const secret = await this.authService.generateTotpKey({
      issuer: this.configService.getOrThrow(EnvVariable.COMPANY_NAME),
      user: email
    });
    return secret;
  }

  async issueTotpBackupKeys() {
    return await this.authService.generateRecoveryCodesForTotpAuth();
  }
}
