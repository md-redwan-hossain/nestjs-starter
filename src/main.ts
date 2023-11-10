import { VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { CustomLogger } from "./modules/internal-layer/logging/custom-logger.provider";
import { EnvVariable } from "./shared/enums/env-variable.enum";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      exposedHeaders: ["access_token", "refresh_token", "password_reset_token"],
      credentials: true
    }
  });

  app.setGlobalPrefix("/api");
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow(EnvVariable.SERVER_PORT);

  app.useLogger(app.get(CustomLogger));
  app.use(cookieParser());
  app.use(helmet());

  if (configService.getOrThrow(EnvVariable.NODE_ENV) === "development") {
    const config = new DocumentBuilder()
      .setTitle("NEST API")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api-doc", app, document);
  }

  app.enableShutdownHooks();

  await app.listen(port, () => console.log(`Application is listening on port ${port}`));
}

bootstrap();
