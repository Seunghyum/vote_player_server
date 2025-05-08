import express from "express";
import Candidates from "@models/candidates";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { koName, pageCount = 15, page = 1 } = req.query;
  const pc = parseInt(pageCount as string);
  const p = parseInt(page as string);
  let isQueryExist = !!koName;
  const query = isQueryExist
    ? { koName: { $regex: koName, $options: "i" } }
    : {};
  const result = await Candidates.find(query)
    .select({
      bills: 0,
      billsCommitteeStatistics: 0,
      collabills: 0,
      collabillsCommitteeStatistics: 0,
    })
    .sort({ koName: 1 })
    .skip((p - 1) * pc)
    .limit(pc);

  const total = await Candidates.find(query).countDocuments();
  const isLastPage = p * pc >= total;
  res.json({ result, summary: { total, isLastPage } });
});

router.get("/:id", function (req, res, next) {
  Candidates.findOne({ _id: req.params.id })
    .select({
      bills: 0,
      collabills: 0,
    })
    .then((candidates) => {
      res.json(candidates);
    });
});

router.get("/:id/bills", async function (req, res, next) {
  console.log("+++++");
  const { pageCount: limit = 15, page = 1, type = "bills" } = req.query;
  let status: string[];
  if (!req.query.status || req.query.status === "전체") {
    status = [
      "가결",
      "수정가결",
      "대안반영폐기",
      "임기만료폐기",
      "계류",
      "폐기",
      "철회",
      "부결",
    ];
  } else {
    status = [req.query.status.toString(), "tmp"]; // 2개 이상은 있어야해서 "전체"를 넣음.
  }

  const pageNumber = parseInt(page.toString(), 10) || 1; // 기본값 1
  const pageSize = parseInt(limit.toString(), 10) || 10; // 기본값 10

  console.log("@@@@ req.params.id : ", req.params.id);
  console.log("@@@@ status : ", status);
  return res.json(
    await getBills({
      type: type.toString(),
      candidateId: req.params.id,
      status,
      page: pageNumber,
      limit: pageSize,
    })
  );
});

interface getBillsProps {
  type: string;
  candidateId: string;
  status: string[];
  page: number;
  limit: number;
}

async function getBills({
  type,
  candidateId,
  status,
  page = 1,
  limit = 10,
}: getBillsProps) {
  const skip = (page - 1) * limit;

  // ObjectId 유효성 검사
  if (!mongoose.Types.ObjectId.isValid(candidateId)) {
    throw new Error("Invalid candidateId");
  }

  const result = await Candidates.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(candidateId) } },
    {
      $lookup: {
        from: type,
        localField: type === "bills" ? "rst_bills" : "publ_bills",
        foreignField: "_id",
        as: type === "bills" ? "rst_bills" : "publ_bills",
      },
    },
    // 상태 필터링
    {
      $addFields: {
        rst_bills:
          Array.isArray(status) && status.length > 0
            ? {
                $filter: {
                  input: type === "bills" ? "$rst_bills" : "$publ_bills",
                  as: "bill",
                  cond: { $in: ["$$bill.PROC_RESULT", status] },
                },
              }
            : type === "bills"
            ? "rst_bills"
            : "publ_bills",
      },
    },
    {
      $project: {
        total: { $size: type === "bills" ? "$rst_bills" : "$publ_bills" },
        paged: {
          $slice: [
            type === "bills" ? "$rst_bills" : "$publ_bills",
            skip,
            limit,
          ],
        },
      },
    },
    {
      $project: {
        result: "$paged",
        summary: {
          total: "$total",
          isLastPage: { $lte: ["$total", skip + limit] },
        },
      },
    },
  ]);

  return result[0] ?? { result: [], summary: { total: 0, isLastPage: true } };
}

router.get("/:id/bills/:billNo", async function (req, res, next) {
  const { type = "bills" } = req.query;
  const { id, billNo } = req.params;

  try {
    const result = await Candidates.aggregate([
      // 1. 특정 후보를 필터링
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      // 2. bills 배열을 펼치기
      { $unwind: `$${type}` },

      // 3. 특정 billId 필터링
      { $match: { [`${type}.billNo`]: billNo } },

      // 4. 결과를 합치기
      {
        $project: {
          _id: `$${type}._id`,
          age: `$${type}.age`,
          name: `$${type}.name`,
          proposers: `$${type}.proposers`,
          committee: `$${type}.committee`,
          date: `$${type}.date`,
          status: `$${type}.status`,
          billNo: `$${type}.billNo`,
          summary: `$${type}.summary`,
          billDetailUrl: `$${type}.billDetailUrl`,
        },
      },
    ]);

    // 결과 반환
    if (result.length === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }
    return res.json(result[0]); // Bill 정보 반환
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
