import { knex as setupKnex, Knex } from "knex";
import { env } from "../env";

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: env.NODE_ENV === "production" ? "js" : "ts",
    directory:
      env.NODE_ENV === "production" ? "./dist/migrations" : "./migrations",
  },
};

export const knex = setupKnex(config);
