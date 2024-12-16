import migrationsRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient,
    dir: join("infra", "migrations"),
    migrationsTable: "pgmigrations",
    direction: "up",
    verbose: true,
  };

  if (request.method === "POST") {
    const migration = await migrationsRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });

    await dbClient.end();

    if (migration.length > 0) {
      return response.status(201).json(migration);
    }

    return response.status(200).json(migration);
  }

  if (request.method === "GET") {
    const migration = await migrationsRunner({
      ...defaultMigrationOptions,
      dryRun: true,
    });
    await dbClient.end();

    return response.status(200).json(migration);
  }

  return response.status(405).end();
}

export default migrations;
