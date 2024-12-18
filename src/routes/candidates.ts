import express from "express";
import Candidates from "@models/candidates";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { koName, pageCount = 15, page = 1 } = req.query;
  const pc = parseInt(pageCount as string);
  const p = parseInt(page as string);

  let isQueryExist = !!koName 
  const query = isQueryExist ? { koName: { $regex: koName, $options: 'i'  } } : {};
  const result = await Candidates.find(query)
    .select({
      bills: 0,
      billsStatistics: 0,
      collabills: 0,
      collabillsStatistics: 0,
    })
    .skip((p-1) * pc)
    .limit(pc);

  const total = await Candidates.find(query).countDocuments();
  const isLastPage = p * pc >= total
  res.json({ result, summary: { total, isLastPage } });
});

router.get("/:id", function (req, res, next) {
  Candidates.findOne({ _id: req.params.id }).then((candidates) => {
    res.json(candidates);
  });
});


export default router;
