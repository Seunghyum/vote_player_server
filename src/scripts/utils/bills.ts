import { $, $$ } from "@lib/selector";
import { Page } from "puppeteer";

export async function iterateAllBills(page: Page) {
  let i = 1;
  let bills: Object[] = [];
  let findNextPageBtn = async (page: Page, num: number) =>
    await $(page, `a[href='javascript:doActionRepBill.goPage(${num})']`);
  let isNextExist = true;
  while (isNextExist) {
    bills = [...bills, ...(await iteratsBillssInPage(page))];
    const nextBtn = await findNextPageBtn(page, ++i);
    await nextBtn?.click();
    isNextExist = !!nextBtn;
  }
  return bills;
}

async function iteratsBillssInPage(page: Page) {
  await await $$(page, "#prpl_cont__repbill__list tr");
  return page.$$eval("#prpl_cont__repbill__list tr", (list) => {
    const arr = [];
    for (const item of list) {
      const obj: { [key: string]: string | null | undefined } = {};
      const 대수 = item.querySelector(".list__ageNm")?.getAttribute("title");
      const 의안명 = item
        .querySelector(".board_subject100.list__billName")
        ?.getAttribute("title");
      const 제안자 = item
        .querySelector(".list__proposer")
        ?.getAttribute("title");
      const 소관위원회 = item
        .querySelector(".list__currCommittee")
        ?.getAttribute("title");
      const 작성일 = item
        .querySelector(".list__proposeDt")
        ?.getAttribute("title");
      const 처리상태 = item
        .querySelector(".list__procResultCd")
        ?.getAttribute("title");

      obj["nth"] = 대수;
      obj["name"] = 의안명;
      obj["proposers"] = 제안자;
      obj["committee"] = 소관위원회;
      obj["date"] = 작성일;
      obj["status"] = 처리상태;

      arr.push(obj);
    }
    return arr;
  });
}
