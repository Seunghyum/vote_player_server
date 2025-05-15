#!/usr/bin/env zx
import { $, chalk, path } from "zx";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

void (async function () {
  const { MONGO_USERNAME, MONGO_PASSWORD } = process.env;

  console.log(chalk.blue("==== mongo remove candidates START ==="));
  try {
    await $`docker exec -it vote_player_server-mongodb-1 mongosh -u ${MONGO_USERNAME} -p ${MONGO_PASSWORD} --eval "use vote-player" --eval "db.candidates.drop();"`;
      console.log(chalk.blue("==== mongo remove candidates SUCCESS ==="));
  } catch(err) {
    console.log(chalk.red(err))
  }
})();