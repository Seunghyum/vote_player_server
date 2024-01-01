import express from "express";
import Candidates from "@models/candidates";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { koName, partyName, pageCount = 15, currentPage = 0 } = req.query;
  const pc = parseInt(pageCount as string);
  const cp = parseInt(currentPage as string);

  let isQueryExist = !!koName || !!partyName;
  const query = isQueryExist ? { $or: [{ koName }, { partyName }] } : {};

  const result = await Candidates.find(query)
    .skip(pc * cp)
    .limit(pc);

  res.json(result);
});

router.get("/:id", function (req, res, next) {
  Candidates.findOne({ _id: req.params.id }).then((candidates) => {
    res.json(candidates);
  });
});

export default router;
