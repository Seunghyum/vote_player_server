
import mongoose, { Schema } from "mongoose";

const CandidatesSchema = new mongoose.Schema(
  {

    // id: Schema.ObjectId,
    // deptCd: String,
    // empNm: String,
    // engNm: String,
    // hjNm: String,
    // jpgLink: String,
    // num: String,
    // origNm: String,
    // reeleGbnNm: String,
    // assemHomep: String,
    // bthDate: String,
    // electionNum: String,
    // polyNm: String,
    // secretary: String,
    // shrtNm: String,
    // staff: String,

    // id: Schema.ObjectId,
    // enName: String,
    // koName: String,
    // partyName: String,
    // intro: {
    //   electoralDistrict: String,
    //   affiliatedCommittee: String,
    //   electionCount: String,
    //   officePhone: String,
    //   officeRoom: String,
    //   memberHomepage: String,
    //   individualHomepage: String,
    //   email: String,
    //   aide: String,
    //   chiefOfStaff: String,
    //   secretary: String,
    //   officeGuide: String,
    // },
    // histroy: String,
      id: Schema.ObjectId,
      enName:              String,
      electoralDistrict:   String,
      affiliatedCommittee: String,
      electionCount:       String,
      officePhone:         String,
      officeRoom:          String,
      individualHomepage:  String,
      email:               String,
      aide:                String,
      chiefOfStaff:        String,
      secretary:           String,
      officeGuide:         String,
      history:             String,
      koName:              String,
      partyName:           String,
      bills:               [{
        nth:           String,
        name:          String,
        proposers:     String,
        committee:     String,
        date:          Date,
        status:        String,
        billNo:        String,
        summary:       String,
        billDetailUrl: String,
      }],
      billsStatistics: [{
        name:  String,
        value: Number,
      }],
      billsStatusStatistics: [{
        name:  String,
        value: Number,
      }],
      collabills:               [{
        nth:           String,
        name:          String,
        proposers:     String,
        committee:     String,
        date:          Date,
        status:        String,
        billNo:        String,
        summary:       String,
        billDetailUrl: String,
      }],
      collabillsStatistics: [{
        name:  String,
        value: Number,
      }],
      collabillsStatusStatistics: [{
        name:  String,
        value: Number,
      }],
      
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
export default mongoose.model("Candidates", CandidatesSchema);
