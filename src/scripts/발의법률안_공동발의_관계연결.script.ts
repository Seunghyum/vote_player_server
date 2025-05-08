import mongoose from "mongoose";
import Bills from "@models/bills"; // 경로는 실제 모델 경로로
import Candidates from "@models/candidates"; // 경로는 실제 모델 경로로
import connectDB from "./utils/connectDB";

async function clearPublLinks() {
  // 1. 모든 Bills의 publ_candidates 초기화
  await Bills.updateMany({}, { $set: { publ_candidates: [] } });
  console.log("🧹 Bills.publ_candidates 초기화 완료");

  // 2. 모든 Candidates의 publ_bills 초기화
  await Candidates.updateMany({}, { $set: { publ_bills: [] } });
  console.log("🧹 Candidates.publ_bills 초기화 완료");
}

async function linkPublProposers() {
  const candidates = await Candidates.find({}, "_id koName");
  const bills = await Bills.find({}, "_id PUBL_PROPOSER");

  const candidateMap = new Map();
  for (const candidate of candidates) {
    candidateMap.set(candidate.koName, candidate._id);
  }

  const bulkBillOps = [];
  const bulkCandidateOps = new Map(); // candidateId -> Set of billIds

  for (const bill of bills) {
    if (!bill.PUBL_PROPOSER) continue;
    const names = (bill.PUBL_PROPOSER as String)
      .split(",")
      .map((n) => n.trim());
    const matchedCandidateIds = [];

    for (const name of names) {
      const candidateId = candidateMap.get(name);
      if (candidateId) {
        matchedCandidateIds.push(candidateId);

        // 후보자 publ_bills 추가 준비
        if (!bulkCandidateOps.has(candidateId.toString())) {
          bulkCandidateOps.set(candidateId.toString(), new Set());
        }
        bulkCandidateOps.get(candidateId.toString()).add(bill._id);
      }
    }

    if (matchedCandidateIds.length > 0) {
      bulkBillOps.push({
        updateOne: {
          filter: { _id: bill._id },
          update: {
            $addToSet: {
              publ_candidates: { $each: matchedCandidateIds },
            },
          },
        },
      });
    }
  }

  if (bulkBillOps.length > 0) {
    await Bills.bulkWrite(bulkBillOps);
    console.log(`✅ ${bulkBillOps.length} bills updated`);
  }

  const bulkCandidateOpsArray = [];
  for (const [candidateId, billIdSet] of bulkCandidateOps.entries()) {
    bulkCandidateOpsArray.push({
      updateOne: {
        filter: { _id: candidateId },
        update: {
          $addToSet: {
            publ_bills: { $each: Array.from(billIdSet) },
          },
        },
      },
    });
  }

  if (bulkCandidateOpsArray.length > 0) {
    await Candidates.bulkWrite(bulkCandidateOpsArray);
    console.log(`✅ ${bulkCandidateOpsArray.length} candidates updated`);
  }
}

connectDB()
  .then(async () => {
    await clearPublLinks();
    await linkPublProposers();
  })
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error("❌ Error occurred:", err);
    mongoose.disconnect();
  });
