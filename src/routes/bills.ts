import express from "express";
import Bills from "@models/bills";
import mongoose from "mongoose";
import axios from "axios";
import { getBillVoteResults } from "src/apis/bills/법률안_표결결과";

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
  const result = await Bills.find(query)
    .select({
      bills: 0,
      billsCommitteeStatistics: 0,
      collabills: 0,
      collabillsCommitteeStatistics: 0,
    })
    .skip((p - 1) * pc)
    .limit(pc);

  const total = await Bills.find(query).countDocuments();
  const isLastPage = p * pc >= total;
  res.json({ result, summary: { total, isLastPage } });
});

router.get("/:billNo", function (req, res, next) {
  Bills.findOne({ BILL_NO: req.params.billNo }).then((bill) => {
    res.json(bill);
  });
});

router.get("/:billId/voteResults", async (req, res, next) => {
  const { AGE, pageCount = 15, page = 1 } = req.query;
  const pc = parseInt(pageCount as string);
  const p = parseInt(page as string);
  const result = await getBillVoteResults({
    BILL_ID: req.params.billId,
    AGE: AGE as string,
    pSize: pc,
    pIndex: p,
  });
  res.json(result);
});
export default router;
