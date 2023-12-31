import mongoose from "mongoose";

const CandidatesSchema = new mongoose.Schema(
  {
    enName: String,
    koName: String,
    partName: String,
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
