import { AccountVerificationDto } from "../../modules/internal-layer/auth/dto/account-verification.dto";
import {
  EmailLoginDto,
  MobileNumberLoginDto
} from "../../modules/internal-layer/auth/dto/login.dto";

export interface IAuthRepository<TEntity, TEntitySelect> {
  readonly entity: TEntity;
  create2faData(id: string, key: string, recoveryCodes: string[]): Promise<TEntitySelect | null>;
  validateEmailLogin(dto: EmailLoginDto): Promise<TEntitySelect | null>;
  validateMobileNumberLogin(dto: MobileNumberLoginDto): Promise<TEntitySelect | null>;
  updateAccountVerificationStatus(dto: AccountVerificationDto, id: string): Promise<boolean>;
  removeUsedRecoveryCode(id: string, updatedCodes: string[]): Promise<TEntitySelect | null>;
  update2faStatus(id: string): Promise<TEntitySelect | null>;
}
