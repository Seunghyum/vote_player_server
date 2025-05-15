import mongoose, { Schema } from "mongoose";

const billVoteResultsSchema = new mongoose.Schema(
  {
    id: Schema.ObjectId,
    HG_NM: String, //	의원
    HJ_NM: String, //	한자명
    POLY_NM: String, //	정당
    ORIG_NM: String, //	선거구
    MEMBER_NO: String, //	의원번호
    POLY_CD: String, //	소속정당코드
    ORIG_CD: String, //	선거구코드
    VOTE_DATE: String, //	의결일자
    BILL_NO: String, //	의안번호
    BILL_NAME: String, //	의안명
    BILL_ID: String, //	의안ID
    LAW_TITLE: String, //	법률명
    CURR_COMMITTEE: String, //	소관위원회
    RESULT_VOTE_MOD: String, //	표결결과
    DEPT_CD: String, //	부서코드(사용안함)
    CURR_COMMITTEE_ID: String, //	소관위코드
    DISP_ORDER: String, //	표시정렬순서
    BILL_URL: String, //	의안URL
    BILL_NAME_URL: String, //	의안링크
    SESSION_CD: String, //	회기
    CURRENTS_CD: String, //	차수
    AGE: String, //	대
    MONA_CD: String, //	국회의원코드
    bill: {
      type: mongoose.Types.ObjectId,
      ref: "Bills",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BillVoteResults", billVoteResultsSchema);
