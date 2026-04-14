import knex, { type Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  pool: {
    min: 0,
    max: 10
  }
};

const globalForKnex = globalThis as typeof globalThis & {
  __komparkDb?: Knex;
};

export const db = globalForKnex.__komparkDb ?? knex(config);

if (process.env.NODE_ENV !== "production") {
  globalForKnex.__komparkDb = db;
}
