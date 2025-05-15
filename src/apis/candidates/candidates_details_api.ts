import axios from "axios";
import mongoose from "mongoose";
import "dotenv/config";

const {
  CANDIDATE_API_KEY,
  MONGO_URI,
  MONGO_DBNAME,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} = process.env;

if (!MONGO_URI) throw Error("dontenv 설정을 확인하세요");

mongoose
  .connect(MONGO_URI, {
    authSource: "admin",
    dbName: MONGO_DBNAME,
    user: MONGO_USERNAME,
    pass: MONGO_PASSWORD,
  })
  .then(() => console.log("Successfully connected to mongodb"))
  .catch((e) => console.error(e));

interface getCandidatesSimplesProps {
  dept_cd: String;
  num: String;
}

export function getCandidatesDetails({
  dept_cd,
  num,
}: getCandidatesSimplesProps) {
  return axios
    .get(
      `https://apis.data.go.kr/9710000/NationalAssemblyInfoService/getMemberDetailInfoList`,
      {
        params: {
          dept_cd,
          num,
          serviceKey: CANDIDATE_API_KEY,
          numOfRows: 10,
          pageNo: 1,
        },
      }
    )
    .then(async (res) => {
      return res.data.response.body.item;
    })
    .catch((err) => console.log("err : ", err));
}
