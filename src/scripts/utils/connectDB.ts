import "dotenv/config";
import mongoose from "mongoose";

const { MONGO_URI, MONGO_DBNAME, MONGO_USERNAME, MONGO_PASSWORD } = process.env;

export default async function connectDB() {
  if (!MONGO_URI) throw Error("dontenv 설정을 확인하세요");
  await mongoose
    .connect(MONGO_URI, {
      authSource: "admin",
      dbName: MONGO_DBNAME,
      user: MONGO_USERNAME,
      pass: MONGO_PASSWORD,
    })
    .then(() => console.log("Successfully connected to mongodb"))
    .catch((e) => console.error(e));
}
