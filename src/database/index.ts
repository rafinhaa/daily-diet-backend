import fs from "fs";
import path from "path";
import { knex as setupKnex, Knex } from "knex";
import { env } from "../env";

const dbPath = path.resolve(env.DATABASE_URL);
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
  migrations: {
    extension: env.NODE_ENV === "production" ? "js" : "ts",
    directory:
      env.NODE_ENV === "production" ? "./dist/migrations" : "./migrations",
  },
};

export const knex = setupKnex(config);
