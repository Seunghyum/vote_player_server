#!/usr/bin/env zx
import { $, chalk, path } from "zx";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

void (async function () {
  const { MONGO_USERNAME, MONGO_PASSWORD } = process.env;

  console.log(chalk.blue("==== mongoimport START ==="));
  try {
    await $`
      for file in /Users/seunghyunmoon/Code/Toy/vote_player_server/data/candidates/*.json; do
        mongoimport --port 27017 \
          --db mongo \
          --collection candidates \
          --file "$file" \
          --authenticationDatabase admin \
          --username ${MONGO_USERNAME} \
          --password ${MONGO_PASSWORD}
      done`;
      console.log(chalk.blue("==== mongoimport SUCCESS ==="));
  } catch(err) {
    console.log(chalk.red(err))
  }
})();
