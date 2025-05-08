import mongoose, { Schema } from "mongoose";

const CandidatesSchema = new mongoose.Schema(
  {
    id: Schema.ObjectId,
    enName: String,
    electoralDistrict: String,
    affiliatedCommittee: String,
    electionCount: String,
    officePhone: String,
    officeRoom: String,
    individualHomepage: String,
    email: String,
    aide: String,
    chiefOfStaff: String,
    secretary: String,
    officeGuide: String,
    history: String,
    koName: String,
    partyName: String,
    rst_bills: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Bills",
      },
    ],
    publ_bills: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Bills",
      },
    ],
    billsCommitteeStatistics: [
      {
        age: String,
        name: String,
        value: Number,
      },
    ],
    billsStatusStatistics: [
      {
        age: String,
        name: String,
        value: Number,
      },
    ],
    collabillsCommitteeStatistics: [
      {
        age: String,
        name: String,
        value: Number,
      },
    ],
    collabillsStatusStatistics: [
      {
        age: String,
        name: String,
        value: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
export default mongoose.model("Candidates", CandidatesSchema);
