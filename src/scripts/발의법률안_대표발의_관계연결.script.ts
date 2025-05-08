import mongoose from "mongoose";

import Candidate from "@models/candidates"; // 모델 경로에 맞게 수정
import Bill from "@models/bills"; // 모델 경로에 맞게 수정
import connectDB from "./utils/connectDB";

async function linkCandidatesAndBills() {
  // 1. 모든 Bills의 publ_candidates 초기화
  await Bill.updateMany({}, { $set: { rst_candidates: [] } });
  console.log("🧹 Bills.rst_candidates 초기화 완료");

  // 2. 모든 Candidates의 publ_bills 초기화
  await Candidate.updateMany({}, { $set: { rst_bills: [] } });
  console.log("🧹 Candidates.rst_bills 초기화 완료");

  const candidates = await Candidate.find();

  for (const candidate of candidates) {
    const { koName, _id: candidateId } = candidate;

    // koName이 RST_PROPOSER인 Bills 찾기
    const bills = await Bill.find({ RST_PROPOSER: koName });

    if (bills.length === 0) continue;

    const billIds = bills.map((bill) => bill._id);

    // Candidate 모델의 bills 필드 업데이트
    await Candidate.updateOne(
      { _id: candidateId },
      { $addToSet: { rst_bills: { $each: billIds } } }
    );

    // 각 Bill의 rst_candidates 필드에 candidateId 추가
    const billUpdatePromises = bills.map((bill) =>
      Bill.updateOne(
        { _id: bill._id },
        { $addToSet: { rst_candidates: candidateId } }
      )
    );

    await Promise.all(billUpdatePromises);

    console.log(
      `✅ Linked ${bills.length} bills to candidate '${koName}' (${candidateId})`
    );
  }

  console.log("🔗 All candidates and bills are linked.");
  // await mongoose.disconnect();
}

connectDB()
  .then(async () => {
    await linkCandidatesAndBills();
  })
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error("❌ Error occurred:", err);
    mongoose.disconnect();
  });

// mongoose
//   .connect(MONGO_URI, {
//     authSource: "admin",
//     dbName: MONGO_DBNAME,
//     user: MONGO_USERNAME,
//     pass: MONGO_PASSWORD,
//   })
//   .then(() => console.log("Successfully connected to mongodb"))
//   .catch((e) => console.error(e));

// async function 발의법률안_관계연결() {
//   const allCandidates = await candidates.find({});

//   for (const candidate of allCandidates) {
//     const targetBills = await bills.find({ RST_PROPOSER: candidate.koName });

//     for (const bill of targetBills) {
//       candidate.updateOne(
//         { koName: bill.RST_PROPOSER },
//         { $push: { bills: bill._id } }
//       );
//       bill.updateOne(
//         {
//           RST_PROPOSER: candidate.koName,
//         },
//         {
//           $push: {
//             rst_candidates: candidate._id,
//           },
//         }
//       );
//       console.log('bill', bill.rst_candidates.length)
//     }
//   }
// }

// 발의법률안_관계연결();
