import { Global, Module } from "@nestjs/common";
import { CRYPTOGRAPHY_SERVICE_DI_TOKEN } from "./cryptography.decorator";
import { CryptographyService } from "./cryptography.service";

@Global()
@Module({
  providers: [{ provide: CRYPTOGRAPHY_SERVICE_DI_TOKEN, useClass: CryptographyService }],
  exports: [CRYPTOGRAPHY_SERVICE_DI_TOKEN]
})
export class CryptographyModule {}
