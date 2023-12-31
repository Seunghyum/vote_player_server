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

(async () => {
  const candidatesFolderPath = path.resolve(__dirname, "../../data/candidates");
  removeDirIfExist(candidatesFolderPath);

  const browser = await puppeteer.launch({
    // headless: false,
    slowMo: 50,
  });
  try {
    const page = await browser.newPage();
    await page.goto(
      "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
    );

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
        const value = item.querySelector("dd")?.innerText;
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
    await createCandidateInfoFromNewTab(page, browser, el);
  }
}

async function createCandidateInfoFromNewTab(
  page: Page,
  browser: Browser,
  element: ElementHandle<Element>
) {
  const waitForWindow = new Promise((resolve: Handler<Page | null>) =>
    page.on("popup", resolve)
  );

  await element.click();
  const newPage = await waitForWindow;

  if (!newPage) return browser.close;

  await newPage.setViewport({ width: 1920, height: 1080 });
  await sleep(500);
  const intro = await getIntroFromHTML(newPage);
  const history = await getHistoryFromHTML(newPage);
  const koName = await getKoNameFromHTML(newPage);
  const enName = await getEnNameFromUrl(newPage);
  const partName = await getPartyNameFromHTML(newPage);

  const obj = {
    enName,
    intro,
    history,
    koName,
    partName,
  };

  const imageElement = await $(newPage, ".img-set .img");
  if (imageElement)
    await writeImageByElement({
      element: imageElement,
      folderPath: path.resolve(__dirname, "../../data/candidates/images"),
      fileName: `${enName}.png`,
    });
  else console.log(`${enName}.png image not created. check out`);
  writeJsonFile({
    obj,
    folderPath: path.resolve(__dirname, "../../data/candidates"),
    fileName: `${enName}.json`,
    dateTime: new Date(),
  });

  await newPage.close();
}

function getHistoryFromHTML(page: Page) {
  return page.$eval(".profile pre", (el) => {
    const value = el?.innerText;

    return value;
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
