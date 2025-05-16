import mongoose from "mongoose";
import Bills from "@models/bills";
import BillVoteResults from "@models/billVoteResults";
import { getBillVoteResults } from "src/apis/bills/법률안_표결결과";
import connectDB from "./utils/connectDB";
import Candidates from "@models/candidates";

async function 발의법률안_표결결과() {
  const bills = await Bills.find({
    PROC_RESULT: { $nin: ["계류", "철회", "대안반영폐기", "임기만료폐기"] },
  });
  console.log(`📄 총 ${bills.length}개의 의안을 처리합니다`);

  const deletedResult = await BillVoteResults.deleteMany({ AGE: "22" });
  console.log(
    `🗑️ 삭제 완료: 기존 ${deletedResult.deletedCount}개의 문서가 삭제되었습니다.`
  );

  for (const bill of bills) {
    const { AGE, BILL_ID, _id: billObjectId } = bill;

    if (!AGE || !BILL_ID) {
      console.warn(`⚠️ BILL_ID 또는 AGE 누락: ${bill.BILL_NAME}`);
      continue;
    }

    try {
      const res = await getBillVoteResults({
        AGE: AGE as string,
        BILL_ID: BILL_ID as string,
        pSize: 300, // 총 의원 수 300
        pIndex: 1,
      });

      if (res.code !== 200 || !res.items?.length) {
        console.log(`🚫 데이터 없음: ${bill.BILL_NAME}`);
        continue;
      }

      // 중복 저장 방지를 위해 BILL_ID + MONA_CD 기준으로 delete 후 insert
      await BillVoteResults.deleteMany({ BILL_ID, bill: billObjectId });
      const voteDocs = [];
      for (const item of res.items) {
        if (item.HG_NM === "조국") {
          voteDocs.push({
            ...item,
            bill: billObjectId,
            candidate: null,
          });
          continue;
        }
        const candidate = await Candidates.findOne({
          koName: item.HG_NM,
        });

        if (!candidate?._id) {
          console.log(`${item.HG_NM}에 해당하는 candidate가 없습니다.`);
        }
        voteDocs.push({
          ...item,
          bill: billObjectId,
          candidate: candidate?._id,
        });
      }
      // });

      await BillVoteResults.insertMany(voteDocs);
      console.log(`✅ 저장 완료: ${bill.BILL_NAME} (${voteDocs.length}건)`);
    } catch (err) {
      console.error(`❌ 처리 실패: ${bill.BILL_NAME}`, err);
    }
  }

  console.log("🎉 전체 작업 완료");
}

connectDB()
  .then(async () => {
    await 발의법률안_표결결과();
  })
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error("❌ Error occurred:", err);
    mongoose.disconnect();
  });
