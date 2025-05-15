export interface BillVoteResultsResponse {
  nojepdqqaweusdfbi?: Nojepdqqaweusdfbi[];
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

export interface Nojepdqqaweusdfbi {
  head?: Head[];
  row?: Row[];
}

export interface Head {
  list_total_count?: number;
  RESULT?: Result;
}

export interface Result {
  CODE: string;
  MESSAGE: string;
}

export interface Row {
  HG_NM: string;
  HJ_NM: null | string;
  POLY_NM: string;
  ORIG_NM: string;
  MEMBER_NO: string;
  POLY_CD: string;
  ORIG_CD: string;
  VOTE_DATE: string;
  BILL_NO: string;
  BILL_NAME: string;
  BILL_ID: string;
  LAW_TITLE: string;
  CURR_COMMITTEE: string;
  RESULT_VOTE_MOD: ResultVoteMod;
  DEPT_CD: string;
  CURR_COMMITTEE_ID: string;
  DISP_ORDER: number;
  BILL_URL: string;
  BILL_NAME_URL: string;
  SESSION_CD: number;
  CURRENTS_CD: number;
  AGE: number;
  MONA_CD: string;
}

export enum ResultVoteMod {
  반대 = "반대",
  불참 = "불참",
  찬성 = "찬성",
}
