import { $, $$ } from "@lib/selector";
import { Browser, Page } from "puppeteer";
import { getNewBrowserTab } from "./page";
import chalk from "chalk";

interface iterateAllBillsProps{
  browser: Browser
  page: Page
  is대표발의: boolean
}
export async function iterateAllBills({browser, page, is대표발의}:iterateAllBillsProps) {
  let pageNum = 1;
  // let bills: Object[] =[];
  let bills = [...(await iteratsBillssInPage({browser, page, is대표발의}))]; // 첫페이지
  while (true) {
    if((await checkNextBillPageExist(page)) === false) {
      break;
    }
    pageNum++
    await clickNextButton(page, pageNum)
    const 변경된_현재버튼 = `//em[@title='현재목록' and contains(text(), '${pageNum}')]`
    await $(page, 변경된_현재버튼, {timeout: 20 * 1000}) // 페이지네이션 js 로드
    bills = [...bills, ...(await iteratsBillssInPage({browser, page, is대표발의}))];
    console.log('페이지 num :', pageNum)
  }
  return bills;
}
async function findCurrentPagePagination(page: Page) {
  return  $$(page, '.paginationSet').then(e => e[e.length-1]) // NOTE 공동법안 화면 안에 대표법안 페이지네이션 엘리먼트가 남아있어서 마지막 엘리먼트 추적.  
}

async function findPaginationNextPageinationButton(page: Page) {
  return (await findCurrentPagePagination(page)).waitForSelector('.i.next')
}

async function clickNextButton(page:Page, num: number) {
  const 현재버튼의_다음버튼 = await (await findCurrentPagePagination(page)).$(`::-p-xpath(//li[@class="active"]/following-sibling::li//a/span[contains(text(), ${num})])`)
  if(!현재버튼의_다음버튼) {
    throw Error('페이지네이션의 현재버튼의 다음 버튼이 없습니다.')
  }
  return 현재버튼의_다음버튼.click()
}
async function findPaginationCurrentPage(page: Page) {
  return (await findCurrentPagePagination(page)).$('li.active')
}

async function checkNextBillPageExist (page:Page) {
  const 현재버튼 = await findPaginationCurrentPage(page)
  return 현재버튼?.evaluate(e => {
    if(e.nextElementSibling === null) {
      throw Error('다음 버튼이 없습니다.')
    }
    return !e.nextElementSibling.getAttribute('class')?.includes('disabled')
  })
}

export async function iteratsBillssInPage({ browser, page, is대표발의 }: iterateAllBillsProps) {
  return $$(page, `#${is대표발의 ? 'prpl_cont__repbill__list' : 'prpl_cont__collabill__list'} tr`).then(async (list) => {
      const arr = [];
      for (const item of list) {
          const obj: { [key: string]: string | null | undefined } = {};
          const 대수 = await item.$eval(".list__ageNm", (el) => el.innerHTML)
          const 의안명 = await item.$eval(".list__billName", (el) => el.getAttribute('title'))
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
              obj["billNo"] = 의안ID
              await page.waitForSelector('#summaryContentDiv', {timeout: 10000})
              const 제안이유_및_주요내용Div = await page.$eval('#summaryContentDiv', (el) => el.innerHTML)
              obj["summary"] = 제안이유_및_주요내용Div
              const 법안상세url = await page.url();
              obj["billDetailUrl"] = 법안상세url
          } catch(err) {
              console.log(`${의안명} ${제안자} ${소관위원회}`)
          }
          
          console.log(chalk.blue(`===#1 의안명: ${의안명}`), chalk.yellow(`제안자 길이: ${제안자}`))
          await page.close();
          // console.log('obj:', obj )
          arr.push(obj);
      }
      // console.log('arr.length : ', arr.length)
      return arr;
  });
}