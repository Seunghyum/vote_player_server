/* 국회의원_정보조회 api - https://open.assembly.go.kr/portal/data/service/selectAPIServicePage.do/OOWY4R001216HX11439 */

import axios from "axios";
import "dotenv/config";

import bills from "@models/bills";
import chalk from "chalk";
import type { BillsResponse } from "./발의법률안Response";
import connectDB from "@scripts/utils/connectDB";
import mongoose from "mongoose";

const { OPEN_API_KEY } = process.env;

interface getBillsType extends Pick<paramsType, "pIndex" | "pSize"> {
  BILL_ID?: String; // (선택)	의안ID	BILL_ID='PRC_Z2Z1Z0Z3X2L4M0H9A2V6K5R0V7P2H1'
  BILL_NO?: String; // (선택)	의안번호	BILL_NO='2113663'
  BILL_NAME?: String; // (선택)	법률안명
  COMMITTEE?: String; // (선택)	소관위원회	COMMITTEE='소관위원회 검색어' (예시) COMMITTEE=2012년
  PROC_RESULT?: String; // (선택)	본회의심의결과	PROC_RESULT='대안반영폐기'
  AGE: number; // (필수)	대수	AGE='21'
  PROPOSER?: String; // (선택)	제안자	PROPOSER='제안자 검색어' (예시) PROPOSER=강경식의원
  COMMITTEE_ID?: String; // (선택)	소관위원회ID	COMMITTEE_ID='9700516'
}
interface paramsType {
  TYPE: String;
  KEY?: String;
  pSize: number;
  pIndex: number;
}
const defaultParams = {
  TYPE: "json",
  KEY: OPEN_API_KEY,
  pSize: 100,
  pIndex: 1,
  AGE: 22,
};
export function getBills(params?: getBillsType) {
  let queryParams: paramsType & getBillsType = {
    ...defaultParams,
    ...params,
  };
  return axios
    .get<BillsResponse>(
      "https://open.assembly.go.kr/portal/openapi/nzmimeepazxkubdpn",
      {
        params: queryParams,
      }
    )
    .then((res) => {
      const items = res.data.nzmimeepazxkubdpn[1]["row"];
      const list_total_count =
        res.data.nzmimeepazxkubdpn[0]["head"]?.[0]["list_total_count"] || 0;
      if (!items) throw Error("api 응답에 문제가 있습니다.");
      return { items, list_total_count };
    });
}

export default async function initBills() {
  let pSize = 1000;
  let pIndex = 1;
  const { items, list_total_count } = await getBills({
    AGE: defaultParams.AGE,
    pIndex,
    pSize,
  });
  if (!items) throw Error("응답 결과 값이 0 입니다.");
  let total = list_total_count;

  let total_items: Awaited<ReturnType<typeof getBills>>["items"] = [];
  while (total > 0) {
    const { items } = await getBills({ AGE: 22, pIndex, pSize });
    pIndex++;
    total -= pSize;
    total_items = [...total_items, ...items];
  }

  if (list_total_count === total_items.length) {
    const origin_count = await bills.countDocuments();
    if (origin_count > 0) await bills.deleteMany({});

    for (let item of total_items) {
      if (!item.PROC_RESULT) item.PROC_RESULT = "계류";
      await bills.create(item);
      console.log(
        chalk.blue(`document 추가 - ${await bills.countDocuments()}`)
      );
    }
  } else {
    throw Error(
      "API list_total_count 와 실제 데이터 갯수가 일치하지 않습니다."
    );
  }
}

connectDB()
  .then(async () => {
    await initBills();
  })
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error("❌ Error occurred:", err);
    mongoose.disconnect();
  });
