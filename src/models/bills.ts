import mongoose, { Schema } from "mongoose";

const billsSchema = new mongoose.Schema(
  {
    id: Schema.ObjectId,
    BILL_ID: String, //	의안ID
    BILL_NO: String, //	의안번호
    BILL_NAME: String, //	법률안명
    COMMITTEE: String, //	소관위원회
    PROPOSE_DT: String, //	제안일
    PROC_RESULT: String, //	본회의심의결과
    AGE: String, //	대수
    DETAIL_LINK: String, //	상세페이지
    PROPOSER: String, //	제안자
    MEMBER_LIST: String, //	제안자목록링크
    LAW_PROC_DT: String, //	법사위처리일
    LAW_PRESENT_DT: String, //	법사위상정일
    LAW_SUBMIT_DT: String, //	법사위회부일
    CMT_PROC_RESULT_CD: String, //	소관위처리결과
    CMT_PROC_DT: String, //	소관위처리일
    CMT_PRESENT_DT: String, //	소관위상정일
    COMMITTEE_DT: String, //	소관위회부일
    PROC_DT: String, //	의결일
    COMMITTEE_ID: String, //	소관위원회ID
    PUBL_PROPOSER: String, //	공동발의자
    LAW_PROC_RESULT_CD: String, //	법사위처리결과
    RST_PROPOSER: String, //	대표발의자
    rst_candidates: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Candidates",
      },
    ],
    publ_candidates: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Candidates",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
export default mongoose.model("Bills", billsSchema);
