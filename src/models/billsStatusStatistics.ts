import mongoose from "mongoose";

const billsStatusStatisticsSchema = new mongoose.Schema(
  {
    PROC_RESULT: String,
    count: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "billsStatusStatistics",
  billsStatusStatisticsSchema
);
