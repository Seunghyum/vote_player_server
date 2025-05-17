import express from "express";
import Bills from "@models/bills";
import billVoteResults from "@models/billVoteResults";
import billsStatusStatistics from "@models/billsStatusStatistics";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { BILL_NAME, age = "22", pageCount = 15, page = 1, status } = req.query;
  const pc = parseInt(pageCount as string);
  const p = parseInt(page as string);
  let isQueryExist = !!BILL_NAME;
  let query: any = isQueryExist
    ? { BILL_NAME: { $regex: BILL_NAME, $options: "i" } }
    : {};
  if (status !== "전체") query.PROC_RESULT = { $eq: status };
  query.AGE = age;
  const [items, statistics] = await Promise.all([
    Bills.find(query)
      .select({
        bills: 0,
        billsCommitteeStatistics: 0,
        collabills: 0,
        collabillsCommitteeStatistics: 0,
        publ_candidates: 0,
      })
      .populate("rst_candidates", "koName enName")
      .skip((p - 1) * pc)
      .limit(pc),
    billsStatusStatistics.find().select("PROC_RESULT count"),
  ]);

  const total = await Bills.find(query).countDocuments();
  const isLastPage = p * pc >= total;
  res.json({ items, summary: { total, isLastPage }, statistics });
});

router.get("/:billNo", function (req, res, next) {
  Bills.findOne({ BILL_NO: req.params.billNo }).then((bill) => {
    res.json(bill);
  });
});

router.get("/:billId/voteResults", async (req, res, next) => {
  try {
    const { AGE } = req.query;
    const result = await billVoteResults
      .find({
        BILL_ID: req.params.billId,
        AGE,
      })
      .populate({
        path: "candidate",
        select: "_id enName", // 가져올 필드만 명시
      })
      .lean();

    if (!result) return res.json({ items: [], statistics: [] });

    const staticsMap: { [key: string]: number } = {};
    const statistics: staticsType = [];
    for (const item of result) {
      if (!item["RESULT_VOTE_MOD"]) continue;
      if (!staticsMap[item["RESULT_VOTE_MOD"]]) {
        staticsMap[item.RESULT_VOTE_MOD] = 0;
      }
      staticsMap[item.RESULT_VOTE_MOD]++;
    }

    for (const [type, value] of Object.entries(staticsMap)) {
      statistics.push({ type, value });
    }
    statistics.sort((a, b) => {
      if (b.value > a.value) return 1;
      else return -1;
    });
    res.json({ items: result, statistics });
  } catch (err) {
    res.json({
      code: 500,
      list_total_count: 0,
      message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요.",
      items: [],
      statistics: [],
    });
  }
});

type staticsType = { type: string; value: number }[];

export default router;
