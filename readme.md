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

- JWT-based stateless authentication flow with RBAC for secure and granular access control.

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
