import mongoose, { Schema } from "mongoose";

const CandidatesSchema = new mongoose.Schema(
  {
    id: Schema.ObjectId,
    enName: String,
    koName: String,
    partyName: String,
    intro: {
      electoralDistrict: String,
      affiliatedCommittee: String,
      electionCount: String,
      officePhone: String,
      officeRoom: String,
      memberHomepage: String,
      individualHomepage: String,
      email: String,
      aide: String,
      chiefOfStaff: String,
      secretary: String,
      officeGuide: String,
    },
    histroy: String,
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
export default mongoose.model("Candidates", CandidatesSchema);
