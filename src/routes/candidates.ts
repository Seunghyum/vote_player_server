import express from "express";
import Candidates from "@models/candidates";
import mongoose from "mongoose";

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
  Candidates
    .findOne({ _id: req.params.id })
    .select({
      bills: 0,
      collabills: 0,
    }).then((candidates) => {
      res.json(candidates);
    });
});

router.get("/:id/bills/", async function (req, res, next) {
  const {pageCount:limit = 15, page = 1, type = 'bills'} = req.query
  let status:string[]
  if(!req.query.status || req.query.status === '전체') {
    status = ['가결','수정안반영폐기','대안반영폐기','임기만료폐기','계류','폐기','철회','부결']
  } else {
    status = [req.query.status.toString()]
  }

  const pageNumber = parseInt(page.toString(), 10) || 1; // 기본값 1
    const pageSize = parseInt(limit.toString(), 10) || 10; // 기본값 10
    const skipCount = (pageNumber - 1) * pageSize;

    const result = await Candidates.aggregate([
      // 1. 특정 후보를 필터링
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },

      // 2. bills 배열을 펼치기
      { $unwind: `$${type}` },

      // 3. bills의 status 필드 조건 필터링
      { $match: { [`${type}.status`]: { $in: status }}},

      // 4. 전체 bills 개수를 계산
      {
        $group: {
          _id: "$_id", // 후보 ID별 그룹화
          bills: { $push: `$${type}` }, // 필터링된 bills를 다시 배열로 묶음
          totalBillsCount: { $sum: 1 }, // 필터링된 bills의 개수를 계산
        },
      },

      // 5. 페이지네이션 처리
      {
        $facet: {
          // 전체 데이터의 개수를 계산 (total 필드)
          totalData: [
            {
              $project: {
                total: "$totalBillsCount", // 계산된 bills 개수를 total로 사용
              },
            },
          ],

          // 페이지네이션 처리
          paginatedData: [
            { $unwind: '$bills' }, // bills 배열을 다시 펼침
            { $sort: { "bills.status": 1 } }, // status 기준으로 내림차순 정렬
            { $skip: skipCount },  // 페이지 시작 위치 스킵
            { $limit: pageSize },  // 페이지 크기만큼 제한
            {
              $project: {
                _id: 0, // `_id` 필드 제외
                nth: "$bills.nth",
                name: "$bills.name",
                proposers: "$bills.proposers",
                committee: "$bills.committee",
                date: "$bills.date",
                status: "$bills.status",
                billNo: "$bills.billNo",
                summary: "$bills.summary",
                billDetailUrl: "$bills.billDetailUrl",
              },
            },
          ],
        },
      },

      // 6. 결과를 합치기
      {
        $project: {
          result: "$paginatedData",
          summary: {
            total: { $arrayElemAt: ["$totalData.total", 0] }, // total 값 가져오기
            isLastPage: {
              $cond: {
                if: {
                  $lte: [
                    { $multiply: [skipCount + pageSize, 1] }, // 현재 페이지의 끝 인덱스
                    { $arrayElemAt: ["$totalData.total", 0] }, // total
                  ],
                },
                then: false,
                else: true,
              },
            },
          },
        },
      },
    ]);

    const allTotal = (await Candidates.findOne({ _id: req.params.id }))?.bills.length ?? 0
    if(result[0]) result[0].summary.allTotal = allTotal

    // 결과 반환 (result는 배열로 감싸져 있음)
    return res.json(result[0] ?? { result: [], summary: { total: 0, allTotal: 0, isLastPage:true } })
});



router.get("/:id/bills/:billNo", async function (req, res, next) {
  const { type = 'bills' } = req.query
  const { id, billNo } = req.params

  try {
    const result = await Candidates.aggregate([
      // 1. 특정 후보를 필터링
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      // 2. bills 배열을 펼치기
      { $unwind: `$${type}` },

        // 3. 특정 billId 필터링
      { $match: { [`${type}.billNo`]: billNo }},

      // 4. 결과를 합치기
      {
        $project: {
          _id: "$bills._id",
          nth: "$bills.nth",
          name: "$bills.name",
          proposers: "$bills.proposers",
          committee: "$bills.committee",
          date: "$bills.date",
          status: "$bills.status",
          billNo: "$bills.billNo",
          summary: "$bills.summary",
          billDetailUrl: "$bills.billDetailUrl",
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
})

export default router;
