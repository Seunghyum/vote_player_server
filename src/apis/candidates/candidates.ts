import mongoose from "mongoose";
import "dotenv/config";
import getCandidatesSimples from "./candidates_simples_api";
import { getCandidatesDetails } from "./candidates_details_api";
import candidates from "@models/candidates";
import chalk from "chalk";

const { MONGO_URI, MONGO_DBNAME, MONGO_USERNAME, MONGO_PASSWORD } = process.env;

if (!MONGO_URI) throw Error("dontenv 설정을 확인하세요");

mongoose
  .connect(MONGO_URI, {
    authSource: "admin",
    dbName: MONGO_DBNAME,
    user: MONGO_USERNAME,
    pass: MONGO_PASSWORD,
  })
  .then(() => console.log("Successfully connected to mongodb"))
  .catch((e) => console.error(e));

export default async function initCandidates() {
  const simples = await getCandidatesSimples();
  for (const simple of simples) {
    const detail = await getCandidatesDetails({
      dept_cd: simple.deptCd,
      num: simple.num,
    });
    await candidates.create({ ...simple, ...detail });
    console.log(
      chalk.blue(`document 추가 - ${await candidates.countDocuments()}`)
    );
  }
}

initCandidates();
