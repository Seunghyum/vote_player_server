import puppeteer, { Browser, ElementHandle, Handler, Page } from "puppeteer";
import {
  removeDirIfExist,
  writeImageByElement,
  writeJsonFile,
  zipDirectory,
} from "@lib/file";
import path from "path";
import fs from "fs";
import sleep from "@lib/sleep";
import { $, $$ } from "@lib/selector";
import { defaultTimeFormat } from "@lib/date";
import { koNameToEnName } from "@constants/column_name_map";

const 의원검색페이지 =
  "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do";

(async () => {
  const candidatesFolderPath = path.resolve(__dirname, "../../data/candidates");
  removeDirIfExist(candidatesFolderPath);

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });
  try {
    const page = await browser.newPage();
    await page.goto(의원검색페이지);

    await page.setViewport({ width: 1920, height: 1080 });

    const pictureBtn = await $(page, "#tab-btn-sect a:nth-child(2)");
    await pictureBtn?.click();

    const selector = "a.nassem_reslut_pic img";
    const elements = await $$(page, selector);
    const candidatesPerPage = elements.length;

    // 첫페이지 크롤링
    if (elements.length === 0)
      throw Error("첫 페이지의 의원 수가 0이 될 수 없습니다");
    console.log("page : 1");
    await iterateCandidatesInPage(page, browser);

    //페이지네이션 순회
    let numOfPagination = 0;
    let i = 0;
    let length = 11;
    for (let i = 0; i < length; i++) {
      const selector = "#pic-sect-pager strong + a.page-number";
      const p = await $(page, selector, { timeout: 5000 });
      console.log("page : ", i + 2);
      if (p) {
        await p.click();

        // 의원 순회
        await iterateCandidatesInPage(page, browser);
      } else {
        numOfPagination = i + 1;
        break;
      }
    }

    const numOfCandidates = await fs.readdirSync(candidatesFolderPath).length;

    const zipPath = path.resolve(
      __dirname,
      `../../data/candidates-${defaultTimeFormat(new Date())}.zip`
    );
    await zipDirectory(candidatesFolderPath, zipPath);
    if (numOfCandidates !== 298)
      throw Error(
        `전체 의석수 300개 중 ${numOfCandidates}개만 크롤링 성공하였습니다.\n
        한 페이지당 총 ${candidatesPerPage}명의 의원.\n
        페이지네이션 총 ${numOfPagination}개만 실행.\n`
      );
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
})();

function getIntroFromHTML(page: Page) {
  return page.$$eval(
    "ul.list li",
    (list, koNameToEnName) => {
      const obj: { [key: string]: string | undefined } = {};

      for (const item of list) {
        const key = item.querySelector("dt")?.innerText?.replace(/\s/g, "");
        const value = item
          .querySelector("dd")
          ?.innerText.replaceAll("\n\n", "\n");
        if (key !== undefined) {
          obj[koNameToEnName[key as keyof typeof koNameToEnName]] = value;
        }
      }
      return obj;
    },
    koNameToEnName
  );
}

async function iterateCandidatesInPage(page: Page, browser: Browser) {
  const selector = "a.nassem_reslut_pic img";
  const elements = await $$(page, selector);

  console.log("elements length : ", elements.length);
  for (const el of elements) {
    await el.click();
    const newPage = await getCurrentPage(page);
    if (newPage === null) throw Error("newPage가 null일 수 없습니다");

    await createCandidateInfoFromPage(newPage, browser, el);

    await newPage.close();
  }
}

function getCurrentPage(page: Page) {
  return new Promise((resolve: Handler<Page | null>) =>
    page.on("popup", resolve)
  );
}

async function createCandidateInfoFromPage(
  page: Page,
  browser: Browser,
  el: ElementHandle<Element>
) {
  if (!page) return browser.close;

  await page.setViewport({ width: 1920, height: 1080 });
  await sleep(500);
  const intro = await getIntroFromHTML(page);
  const history = await getHistoryFromHTML(page);
  const koName = await getKoNameFromHTML(page);
  const enName = await getEnNameFromUrl(page);
  const partyName = await getPartyNameFromHTML(page);

  const imageElement = await $(page, ".img-set .img");
  if (imageElement)
    await writeImageByElement({
      element: imageElement,
      folderPath: path.resolve(__dirname, "../../data/candidates/images"),
      fileName: `${enName}.png`,
    });
  else console.log(`${enName}.png image not created. check out`);

  const 의정활동menu = await $(page, ".menu li:nth-child(2)");
  await 의정활동menu?.click();

  const bills = await get의정활동TableFromHTML(page);

  const obj = {
    enName,
    ...intro,
    history,
    koName,
    partyName,
    bills,
  };

  writeJsonFile({
    obj,
    folderPath: path.resolve(__dirname, "../../data/candidates"),
    fileName: `${enName}.json`,
  });
}

async function get의정활동TableFromHTML(page: Page) {
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

function getHistoryFromHTML(page: Page) {
  return page.$eval(".profile pre", (el) => {
    const value = el?.innerText;

    return value.replaceAll("\n\n", "\n");
  });
}
function getEnNameFromUrl(page: Page) {
  const arr = page.url().split("/");
  return arr[arr.length - 1];
}

function getKoNameFromHTML(page: Page) {
  return page.$eval(".tit strong", (el) => {
    const value = el?.innerText;
    const name = value.split(" ")[0];

    return name;
  });
}

function getPartyNameFromHTML(page: Page) {
  return page.$eval(".tit dd", (el) => {
    const value = el?.innerText;

    return value;
  });
}
