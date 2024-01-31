import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const UserData = createParamDecorator<string>(
  (data: "id" | "role", ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    return data ? user?.[data] : user;
  }
);
