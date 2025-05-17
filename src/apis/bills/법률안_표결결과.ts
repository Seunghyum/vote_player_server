/* 국회의원 본회의 표결정보 데이터 api - https://open.assembly.go.kr/portal/data/service/selectServicePage.do */

import axios from "axios";
import "dotenv/config";
import type { BillVoteResultsResponse } from "./법률안_표결결과Response";

const { OPEN_API_KEY } = process.env;

interface getBillVoteResultsType extends Pick<paramsType, "pIndex" | "pSize"> {
  HG_NM?: String; // (선택)	의원	HG_NM='황희'
  POLY_NM?: String; // (선택)	정당	POLY_NM='친박신당'
  MEMBER_NO?: String; // (선택)	의원번호	MEMBER_NO='2100000000301'
  VOTE_DATE?: String; // (선택)	의결일자	VOTE_DATE='11-NOV-21'
  BILL_NO?: String; // (선택)	의안번호	BILL_NO='2113244'
  BILL_NAME?: String; // (선택)	의안명	BILL_NAME='10·27법난 피해자의 명예회복 등에 관한 법률 일부개정법률안'
  BILL_ID?: String; // (필수)	의안ID	BILL_ID='PRC_Z2Z1S0W8P1O8G2A3D1E0V2Q0X2X5J3'
  CURR_COMMITTEE?: String; // (선택)	소관위원회	CURR_COMMITTEE='가습기살균제 사고 진상규명과 피해구제 및 재발방지 대책마련을 위한 국정조사특별위원회'
  RESULT_VOTE_MOD?: String; // (선택)	표결결과	RESULT_VOTE_MOD='찬성'
  CURR_COMMITTEE_ID?: String; // (선택)	소관위코드	CURR_COMMITTEE_ID='9700529'
  MONA_CD?: String; // (선택)	국회의원코드	MONA_CD='ZYP7962W'
  AGE?: String; // (필수)	대	AGE='21'
}
interface paramsType {
  TYPE: String;
  KEY?: String;
  pSize: number;
  pIndex: number;
  AGE: String;
}
const defaultParams = {
  TYPE: "json",
  KEY: OPEN_API_KEY,
  pSize: 100,
  pIndex: 1,
  AGE: "22",
};
export function getBillVoteResults(params: getBillVoteResultsType) {
  const queryParams: paramsType & getBillVoteResultsType = {
    ...defaultParams,
    ...params,
  };
  return axios
    .get<BillVoteResultsResponse>(
      "https://open.assembly.go.kr/portal/openapi/nojepdqqaweusdfbi",
      {
        params: queryParams,
      }
    )
    .then((res) => {
      try {
        const items = res.data.nojepdqqaweusdfbi?.[1]["row"];
        const list_total_count =
          res.data.nojepdqqaweusdfbi?.[0]["head"]?.[0]["list_total_count"] || 0;
        if ((items?.length ?? 0) === 0)
          return {
            code: 200,
            list_total_count,
            message: "해당하는 데이터가 없습니다.",
            items,
          };
        return {
          code: 200,
          list_total_count,
          isLastPage:
            queryParams.pSize * queryParams.pIndex >= list_total_count,
          items,
        };
      } catch (err) {
        return { code: 500, items: [], statistics: [], list_total_count: 0 };
      }
    });
}
