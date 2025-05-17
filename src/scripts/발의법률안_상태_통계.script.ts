import mongoose from "mongoose";
import BillsStatusStatistics from "@models/billsStatusStatistics";
import connectDB from "./utils/connectDB";
import Bills from "@models/bills";

async function 발의법률안_상태_통계() {
  try {
    // 1. 통계 수집 (GROUP BY PROC_RESULT)
    const result = await Bills.aggregate([
      {
        $group: {
          _id: "$PROC_RESULT",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          PROC_RESULT: "$_id",
          count: 1,
        },
      },
      {
        $sort: {
          count: -1, // 🔽 count 기준 내림차순 정렬
        },
      },
    ]);

    // 2. 기존 통계 초기화 (선택 사항)
    await BillsStatusStatistics.deleteMany({});

    // 3. 결과 저장
    await BillsStatusStatistics.insertMany(result);

    console.log("✅ Bills status statistics generated and saved.");
  } catch (err) {
    console.error("❌ Error generating statistics:", err);
  }
}

connectDB()
  .then(async () => {
    await 발의법률안_상태_통계();
  })
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error("❌ Error occurred:", err);
    mongoose.disconnect();
  });
