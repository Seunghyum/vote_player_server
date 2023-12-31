import express from "express";
import mongoose from "mongoose";
import candidatesRoute from "@routes/candidates";
import "dotenv/config";

const app = express();
const { PORT, MONGO_URI } = process.env;

app.use("/candidates", candidatesRoute);

if (!MONGO_URI) throw Error("dontenv 설정을 확인하세요");
mongoose
  .connect(MONGO_URI, {
    authSource: "admin",
    user: "admin",
    pass: "password",
  })
  .then(() => console.log("Successfully connected to mongodb"))
  .catch((e) => console.error(e));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
