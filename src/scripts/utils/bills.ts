import { $, $$ } from "@lib/selector";
import { Browser, Page } from "puppeteer";
import { getNewBrowserTab } from "./page";

export async function iterateAllBills(browser: Browser, page: Page) {
  let i = 1;
  let bills: Object[] = [];
  let isNextExist = true;
  let findNextPageBtn = async (page: Page, num: number) => {
    const 다음버튼sel = `//*[@class='page-number' and contains(text(), '${num}')]`
    const target = await $(page, 다음버튼sel)
    if( !target?.isVisible) {
      return await $(page, 다음버튼sel)
    } else  {
      isNextExist = false
      return null
    }
  }
  while (isNextExist) {
    bills = [...bills, ...(await iteratsBillssInPage(browser, page))];
    const nextBtn = await findNextPageBtn(page, ++i);
    await nextBtn?.click();
    isNextExist = !!nextBtn;
  }
  return bills;
}



export async function iteratsBillssInPage(browser: Browser, page: Page) {
  return $$(page, "#prpl_cont__repbill__list tr").then(async (list) => {
      const arr = [];
      for (const item of list) {
          const obj: { [key: string]: string | null | undefined } = {};
          const 대수 = await item.$eval(".list__ageNm", (el) => el.innerHTML)
          const 의안명 = await item.$eval(".board_subject100.list__billName", (el) => el.getAttribute('title'))
          const 제안자 = await item.$eval(".list__proposer", (el) => el.getAttribute('title'))
          const 소관위원회 = await item.$eval(".list__currCommittee", (el) => el.getAttribute('title'))
          const 작성일 = await item.$eval(".list__proposeDt", (el) => el.getAttribute('title'))
          const 처리상태 = await item.$eval(".list__procResultCd", (el) => el.getAttribute('title'))

          obj["nth"] = 대수;
          obj["name"] = 의안명;
          obj["proposers"] = 제안자;
          obj["committee"] = 소관위원회;
          obj["date"] = 작성일;
          obj["status"] = 처리상태;

          await item.$eval(".align_left.td_block a", (el)=>el.click())
          const page = await getNewBrowserTab(browser)
          try {
              await ('//*[contains(text(), "의안접수정보")]')
              await page.waitForSelector('.contIn .tableCol01 table tbody tr td', {timeout: 10000})
              const 의안ID = await page.$eval('.contIn .tableCol01 table tbody tr td',(el) => el.innerText)
              obj["billId"] = 의안ID
              await page.waitForSelector('#summaryContentDiv', {timeout: 10000})
              const 제안이유_및_주요내용Div = await page.$eval('#summaryContentDiv', (el) => el.innerHTML)
              obj["summary"] = 제안이유_및_주요내용Div
          } catch(err) {
              console.log(`${의안명} ${제안자} ${소관위원회}`)
          }
          
          await page.close();
          // console.log('obj:', obj )
          arr.push(obj);
      }
      console.log('arr.length : ', arr.length)
      return arr;
  });
}