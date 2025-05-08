export interface BillsResponse {
  nzmimeepazxkubdpn: Nzmimeepazxkubdpn[];
}

export interface Nzmimeepazxkubdpn {
  head?: Head[];
  row?: {
    BILL_ID: String | null; //	의안ID
    BILL_NO: String | null; //	의안번호
    BILL_NAME: String | null; //	법률안명
    COMMITTEE: String | null; //	소관위원회
    PROPOSE_DT: String | null; //	제안일
    PROC_RESULT: String | null; //	본회의심의결과
    AGE: String | null; //	대수
    DETAIL_LINK: String | null; //	상세페이지
    PROPOSER: String | null; //	제안자
    MEMBER_LIST: String | null; //	제안자목록링크
    LAW_PROC_DT: String | null; //	법사위처리일
    LAW_PRESENT_DT: String | null; //	법사위상정일
    LAW_SUBMIT_DT: String | null; //	법사위회부일
    CMT_PROC_RESULT_CD: String | null; //	소관위처리결과
    CMT_PROC_DT: String | null; //	소관위처리일
    CMT_PRESENT_DT: String | null; //	소관위상정일
    COMMITTEE_DT: String | null; //	소관위회부일
    PROC_DT: String | null; //	의결일
    COMMITTEE_ID: String | null; //	소관위원회ID
    PUBL_PROPOSER: String | null; //	공동발의자
    LAW_PROC_RESULT_CD: String | null; //	법사위처리결과
    RST_PROPOSER: String | null; //	대표발의자
  }[];
}

export interface Head {
  list_total_count?: number;
  RESULT?: Result;
}

export interface Result {
  CODE: string;
  MESSAGE: string;
}
