import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { IAuthRepository } from "../../../shared/interfaces/IAuthRepository";
import { currentLocalTimeStamp } from "../../../shared/utils/helpers/current-local-timestamp";
import { DrizzleQueryBuilderSyntax } from "../../data-layer/drizzle.decorator";
import { ReadStuff, StuffEntity } from "../../data-layer/drizzle/types";
import { AbstractJwtAuthService } from "../../internal-layer/auth/abstracts/jwt-auth.abstract";
import { AccountVerificationDto } from "../../internal-layer/auth/dto/account-verification.dto";
import { EmailLoginDto, MobileNumberLoginDto } from "../../internal-layer/auth/dto/login.dto";
import { StuffCrudRepository } from "./stuff-crud.repository";
import { InjectStuffEntity } from "./stuff.decorator";

@Injectable()
export class StuffAuthRepository implements IAuthRepository<StuffEntity, ReadStuff> {
  constructor(
    @DrizzleQueryBuilderSyntax() private readonly db: PostgresJsDatabase,
    @InjectStuffEntity() readonly entity: StuffEntity,
    private readonly crudRepo: StuffCrudRepository,
    private readonly jwtAuthService: AbstractJwtAuthService
  ) {}

  async create2faData(id: string, key: string, recoveryCodes: string[]): Promise<ReadStuff | null> {
    const [data] = await this.db
      .update(this.entity)
      .set({
        AuthenticatorKey: key,
        RecoveryCodes: recoveryCodes,
        UpdatedAt: currentLocalTimeStamp()
      })
      .where(eq(this.entity.Id, id))
      .returning();

    return data?.Id ? data : null;
  }

  async validateEmailLogin(dto: EmailLoginDto): Promise<ReadStuff | null> {
    const retrivedEntity = await this.crudRepo.findOneByUniqueIdentifier(dto.Email);
    if (!retrivedEntity) return null;

    const isValidPassword = bcrypt.compare(dto.Password, retrivedEntity.Password);
    if (!isValidPassword) return null;

    return retrivedEntity;
  }

  async validateMobileNumberLogin(dto: MobileNumberLoginDto): Promise<ReadStuff | null> {
    const [retrivedEntity] = await this.db
      .select()
      .from(this.entity)
      .where(eq(this.entity.MobileNumber, dto.MobileNumber));

    if (!retrivedEntity) return null;

    const isValidPassword = bcrypt.compare(dto.Password, retrivedEntity.Password);
    if (!isValidPassword) return null;

    return retrivedEntity;
  }

  async updateAccountVerificationStatus(dto: AccountVerificationDto, id: string): Promise<boolean> {
    const [data] = await this.db
      .update(this.entity)
      .set({ IsVerified: true, UpdatedAt: currentLocalTimeStamp() })
      .where(eq(this.entity.Id, id))
      .returning({ Id: this.entity.Id });
    return data?.Id ? true : false;
  }

  async removeUsedRecoveryCode(id: string, updatedCodes: string[]): Promise<ReadStuff | null> {
    const [data] = await this.db
      .update(this.entity)
      .set({ RecoveryCodes: updatedCodes, UpdatedAt: currentLocalTimeStamp() })
      .where(eq(this.entity.Id, id))
      .returning();
    return data?.Id ? data : null;
  }

  async update2faStatus(id: string): Promise<ReadStuff | null> {
    const [data] = await this.db
      .update(this.entity)
      .set({ IsTwoFactorAuthConfirmed: true, UpdatedAt: currentLocalTimeStamp() })
      .where(eq(this.entity.Id, id))
      .returning();
    return data?.Id ? data : null;
  }
}
