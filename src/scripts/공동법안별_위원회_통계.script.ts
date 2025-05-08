import mongoose from "mongoose";
import Candidates from "@models/candidates";
import "@models/bills";
import connectDB from "./utils/connectDB";

async function updateCollaBillsStatistics() {
  const candidates = await Candidates.find({}).populate("publ_bills");

  for (const candidate of candidates) {
    const statMap: Record<
      string,
      { age: string; name: string; value: number }
    > = {};

    // publ_bills 배열에서 AGE와 COMMITTEE 기준으로 카운트
    for (const bill of candidate.publ_bills as any) {
      const age = bill.AGE;
      const committee = bill.COMMITTEE;

      if (!age || !committee) continue;

      const key = `${age}::${committee}`;
      if (!statMap[key]) {
        statMap[key] = { age, name: committee, value: 0 };
      }
      statMap[key].value += 1;
    }

    // Map -> Array 변환 후 value 기준 이중 정렬
    const statArray = Object.values(statMap).sort((a, b) => {
      if (b.age !== a.age) {
        return parseInt(b.age) - parseInt(a.age);
      }
      return b.value - a.value;
    });

    // // 저장
    console.log("statArray : ", statArray);
    await Candidates.findByIdAndUpdate(candidate._id, {
      $set: {
        collabillsCommitteeStatistics: statArray,
      },
    });
    console.log(`Updated candidate: ${candidate.koName || candidate.enName}`);
  }
}

connectDB()
  .then(async () => {
    await updateCollaBillsStatistics();
  })
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error("❌ Error occurred:", err);
    mongoose.disconnect();
  });
