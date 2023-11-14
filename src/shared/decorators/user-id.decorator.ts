import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const UserId = createParamDecorator<string>((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request?.user?.Id as string;
});
