import fastify, { FastifyLoggerOptions } from "fastify";
import cookie, { FastifyCookieOptions } from "@fastify/cookie";
import { env } from "./env";
import * as Sentry from "@sentry/node";
import pino, { Logger as PinoLogger } from "pino";

import { users } from "@/routes/user";
import { ZodError } from "zod";
import { BaseError } from "@/errors/baseError";
import { meals } from "./routes/meal";
import { auth } from "./routes/auth";

Sentry.init({
  dsn: env.SENTRY_DSN,
});

type LoggerConfig = boolean | FastifyLoggerOptions | PinoLogger;

function getLogger(): LoggerConfig {
  if (env.NODE_ENV === "development") {
    return pino({
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:mm:ss Z",
          ignore: "pid,hostname",
        },
      },
    });
  }

  if (env.NODE_ENV === "test") {
    return false;
  }

  return {
    level: "info",
    serializers: {
      res: (res) => ({
        statusCode: res.statusCode,
      }),

      req: (req) => ({
        ip: req.headers["x-forwarded-for"] || req.ip,
        method: req.method,
        url: req.url,
        hostname: req.hostname,
        remoteAddress: req.socket?.remoteAddress,
        remotePort: req.socket?.remotePort,
      }),
    },
  };
}

export const app = fastify({
  logger: getLogger(),
});

app.register(cookie, {
  secret: env.COOKIE_SECRET,
} as FastifyCookieOptions);

app.register(users, { prefix: "/user" });
app.register(meals, { prefix: "/meal" });
app.register(auth, { prefix: "/auth" });

app.setErrorHandler((error, _, reply) => {
  const mappingError = {
    production: () => Sentry.captureException(error),
    development: () => console.error(error),
    test: () => console.warn(error),
  }[env.NODE_ENV];

  mappingError();

  if (error instanceof ZodError)
    return reply.status(400).send({
      statusCode: 400,
      error: "Validation error",
      message: error.format(),
    });

  if (error instanceof BaseError)
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.error,
      message: error.message,
    });

  reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: "Ocorreu um erro interno",
  });
});
