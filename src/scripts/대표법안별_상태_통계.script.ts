import mongoose from "mongoose";
import Candidates from "@models/candidates";
import "@models/bills";
import connectDB from "./utils/connectDB";

async function updateCandidatesBillStatistics() {
  const candidates = await Candidates.find({}).populate("rst_bills");

  for (const candidate of candidates) {
    const statsMap: Map<string, Map<string, number>> = new Map();

    for (const bill of candidate.rst_bills as any) {
      const age = bill.AGE;
      let name = bill.PROC_RESULT;

      if (!age) continue;
      if (!name) name = "계류";

      if (!statsMap.has(age)) {
        statsMap.set(age, new Map());
      }

      const nameMap = statsMap.get(age)!;
      nameMap.set(name, (nameMap.get(name) || 0) + 1);
    }

    // Map -> Array 변환 + 정렬
    const statsArray = Array.from(statsMap.entries())
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // AGE 내림차순
      .flatMap(([age, nameMap]) => {
        return Array.from(nameMap.entries())
          .sort((a, b) => b[1] - a[1]) // value 내림차순
          .map(([name, value]) => ({ age, name, value }));
      });

    // 필드 업데이트
    console.log("statsArray : ", statsArray);
    // 저장
    await Candidates.findByIdAndUpdate(candidate._id, {
      $set: {
        billsStatusStatistics: statsArray,
      },
    });
    console.log(`Updated candidate: ${candidate.koName || candidate.enName}`);
  }

  console.log("모든 후보자의 통계가 업데이트되었습니다.");
}

connectDB()
  .then(async () => {
    await updateCandidatesBillStatistics();
  })
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error("❌ Error occurred:", err);
    mongoose.disconnect();
  });
