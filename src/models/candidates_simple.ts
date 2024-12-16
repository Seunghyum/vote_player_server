/* 국회의원_현황_조회 api */

import mongoose, { Schema } from "mongoose";

const candidatesSimpleSchema = new mongoose.Schema(
  {
    id: Schema.ObjectId,
    deptCd: String,
    empNm: String,
    engNm: String,
    hjNm: String,
    jpgLink: String,
    num: String,
    origNm: String,
    reeleGbnNm: String,
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
export default mongoose.model("CandidatesSimples", candidatesSimpleSchema);
