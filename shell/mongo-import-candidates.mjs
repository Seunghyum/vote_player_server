#!/usr/bin/env zx
import { $, chalk, path } from "zx";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

void (async function () {
  const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_IMPORT_DADA_PATH } = process.env;
  console.log(MONGO_USERNAME)
  console.log(MONGO_PASSWORD)
  console.log(MONGO_IMPORT_DADA_PATH)
  try {
    await $`
      for file in ${MONGO_IMPORT_DADA_PATH}/candidates/*.json; do
        mongoimport --port 27017 \
          --db vote-player \
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
