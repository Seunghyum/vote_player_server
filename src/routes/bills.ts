import express from "express";
import Bills from "@models/bills";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { BILL_NAME, age = "21", pageCount = 15, page = 1 } = req.query;
  const pc = parseInt(pageCount as string);
  const p = parseInt(page as string);
  let isQueryExist = !!BILL_NAME;
  let query: any = isQueryExist
    ? { BILL_NAME: { $regex: BILL_NAME, $options: "i" } }
    : {};
  query.AGE = age;
  // console.log("query : ", query);
  // console.log(await Bills.findOne());
  const result = await Bills.find(query)
    // .select({
    // bills: 0,
    // billsCommitteeStatistics: 0,
    // collabills: 0,
    // collabillsCommitteeStatistics: 0,
    // })
    .skip((p - 1) * pc)
    .limit(pc);

  const total = await Bills.find(query).countDocuments();
  const isLastPage = p * pc >= total;
  res.json({ result, summary: { total, isLastPage } });
});

export default router;
