import { parseConfig } from "redis-connection-string";

export function redisUrlParser(rawRedisConnectionUrl: string): {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
} {
  const redisparsedUrl = parseConfig(rawRedisConnectionUrl);

  return {
    host: redisparsedUrl?.host,
    port: redisparsedUrl?.port,
    password: redisparsedUrl?.password,
    db: redisparsedUrl?.db
  };
}
