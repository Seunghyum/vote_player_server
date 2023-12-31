import express from "express";
import candidatesRoute from "@routes/candidates";

const app = express();
const port = 8080;

app.use("/candidates", candidatesRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
