# nestjs starter

## features

- Modular architecture adhering to SOLID principles for enhanced scalability and maintainability.

- Postgresql as the primary Database with Drizzle ORM.

- Structured logging with MongoDB, ensuring comprehensive system behavior analysis.

- Redis-based cache management for swift data access and optimization.

- Redis based API throttling.

- Bullmq based redis queue.

- Mailgun based email sending service.

- Dockerized Postgresql, MongoDB, Redis.

- Iron-strong server-side validation for robust data integrity and security.

- Github Dependabot for always up-to-date npm packages.

- JWT-based stateless authentication flow with Role based access control(RBAC) for secure and granular access control.

- Redis based JWT token blacklist cache.

- TOTP based Two Factor authentication.

- Fully documented API with Swagger at http://127.0.0.1:3000/api-doc for comprehensive reference.

## configuring environment variables

- create `.env.dev` and `env.prod` files from .env.example
- then initilize `.env.dev` and `env.prod` files with proper values

```bash
cp .env.example .env.dev && cp .env.example .env.prod
```

## Running Postgresql and Redis in Docker

```bash
# Normal mode
docker compose up

# Background mode
docker compose up -d

# Stopping containers
docker compose stop
```

- **If you are running the database for the first time, you need to apply the `migration.sql` file to the database.**

- **To pull all database tables as Drizzle schema, run `npx drizzle-kit introspect:pg`**

- **The API is completely documented with proper types, head over to http://127.0.0.1:3000/api-doc for comprehensive reference.**

## Json Web Token (JWT) authentication

- To apply jwt authentication on a controller or route handler method, simply add the `@UseGuards(JwtAuthGuard)` decorator.

- You can customize `JwtAuthGuard` class with your custom logic. Currently, It is utilizing `access_token` in the request header. It also maintains a token blacklist cache through redis. The blacklist cache ensures that after logout, the same token can't be used again to make requests.

## Role Based Access Control (RBAC)

- To apply jwt authentication on a controller or route handler method, simply add the following decorators. Populate the array in `@AllowedRoles` decorator with approprite values.

- You can add more values in `USER_ROLE` enum on demand.

```typescript
@AllowedRoles([USER_ROLE.ADMIN, USER_ROLE.MODERATOR])
@UseGuards(RoleGuard)
```

## Two factor authentication

- On signup, you will get `AuthenticatorKey`, `RecoveryCodes`, and `Url`. `AuthenticatorKey` and `RecoveryCodes` will be encrypted by your password.

- `RecoveryCodes` are hashed by `bcrypt` when saving in the database, so after the signup response, you won't be able to retrive them again. Store them in safe place for further use.

- `Url` can be used to generate QR code, but the secret in the `URL` will be `placeholder`. You have to decrypt `AuthenticatorKey` by your password, and replace `placeholder` with the decrypted value.

- In the database, `AuthenticatorKey` will be saved as an encrypted string which will be encrypted by your password.

- After setting up TOTP with the data described above, you have to send the 30 second lived numeric token every time you do a login.

- After the initial successful login, an email will be send with a verification code. Use that code to active your account by sending a POST request to the `verify` route.

- If you do not have access to TOTP token, you can use one of the recovery codes in `2fa-recovery-code-login` route. Each used recovery code can not be used again since it will be removed from the database after successful use. Keep in mind, this route can only be used after activating TOTP in your account.

## Custom Decorators

**To reduce boilerplate codes, various Custom Decorators are provided.**

`@JwtRbacAuth(roles: USER_ROLE[])`: This custom decorator takes the same argument as `AllowedRoles`. It wraps up JWT and RBAC along with proper response decorators.

```typescript
export function JwtRbacAuth(roles: USER_ROLE[]) {
  return applyDecorators(
    AllowedRoles(roles),
    UseGuards(JwtAuthGuard),
    UseGuards(RoleGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
    ApiForbiddenResponse()
  );
}
```

`@UserId()`: This custom decorator doesnot take any argument. It must be used with `JwtRbacAuth` or `UseGuards(JwtAuthGuard)` because it fetches `user.Id` from `request` object. Simply call it in a controller route handler method argument.

```typescript
async findOne(@UserId() id: string) { }
```

`@UserData(data: "Id"|"Role")`: This custom decorator takes `"Id"` or `"Role"` as argument. It must be used with `JwtRbacAuth` or `UseGuards(JwtAuthGuard)` because it fetches `"Id"` or `"Role"` from `request.user` object. Simply call it in a controller route handler method argument.

```typescript
async findOne(@UserData("Role") role: string) { }
```
