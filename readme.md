# nestjs starter

## features

- Modular architecture adhering to SOLID principles for enhanced scalability and maintainability.

- Complete Admin functionality with REST endpoints labelled as Stuff. Stuff can be three types: SuperAdmin, Admin, Moderator.

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

## Note about SWC compiler:

- To achieve 20X speed, this repo utilizes SWC compiler instead of the default TSC compiler to compile Typescript to Javascript.

- In windows, You must install [Microsoft Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe) to work with SWC compiler.

- In any type of build error, remove `node_modules` folder and run `npm install` to install the dependencies again. This type of error can arise when you switch platform like linux to windows and vice-versa.

## Configuring environment variables

- Run `npm run make-env` to make the `.env.*` files from the example .env files.
- then initilize them with proper values

## Running Postgresql and Redis in Docker

```bash
# Normal mode
docker compose up

# Background mode
docker compose up -d

# Stopping containers
docker compose stop
```

## Database Migration

- Migrations are managed by [DbMate.](https://github.com/amacneil/dbmate)

- Migrations will be applied and rollbacked sequentially.

- If you are running the database for the first time, you need to apply the migrations to the database.

- Drizzle ORM is preferred for doing queries in the application.

- To pull all database tables as Drizzle schema, run `npx drizzle-kit introspect:pg` for postgresql.

- Using Drizzle or any kind of ORM for migrations is not recommended since they lack support of many DB specific features.

```bash
# list of all migrations with status
npm run migrator:list

# apply a migration
npm run migrator:apply

# rollback a migration
npm run migrator:rollback

# create a new blank migration
# write sql in the generated migration file
npm run migrator:new

# force push the db schema
npm run migrator:schema-force-push
```

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

## Custom Decorators

**To reduce boilerplate codes, various Custom Decorators are provided.**

**`@JwtRbacAuth(roles: USER_ROLE[])`**: This custom decorator takes the same arguments as `AllowedRoles`. It wraps up JWT and RBAC along with proper response decorators. Simply call it on top of any controller route handler method.

```typescript
  @JwtRbacAuth([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN])
  @Get("profile")
  @ApiOperation({ summary: "stuff profile" })
  @ApiOkResponse({ type: ResponseStuffDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async findOne(@UserId() id: string, @Res() response: Response) {}
```

The implementation of this decorator is given below:

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

**`@UserId()`**: This custom decorator doesnot take any argument. It must be used with `JwtRbacAuth` or `UseGuards(JwtAuthGuard)` because it fetches `user.id` from `request` object. Simply call it in any controller route handler method argument. Example:

```typescript
async findOne(@UserId() id: string) { }
```

**`@UserData(data: "id"|"role")`**: This custom decorator takes `"id"` or `"role"` as argument. It must be used with `JwtRbacAuth` or `UseGuards(JwtAuthGuard)` because it fetches `"id"` or `"role"` from `request.user` object. Simply call it in any controller route handler method argument. Example:

```typescript
async findOne(@UserData("role") role: string) { }
```
