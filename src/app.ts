import express from "express";
import mongoose from "mongoose";
import billsRoute from "@routes/bills";
import candidatesRoute from "@routes/candidates";
import regionRoute from "@routes/region";
import congressmanRoute from "@routes/congressmans";
import "dotenv/config";

const app = express();
const { PORT, MONGO_URI, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DBNAME } =
  process.env;

app.use("/bills", billsRoute);
app.use("/candidates", candidatesRoute);
app.use("/region", regionRoute);
app.use("/congressmans", congressmanRoute);

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
