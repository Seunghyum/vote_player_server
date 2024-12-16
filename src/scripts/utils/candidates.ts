import type { Browser, Handler, Page } from "puppeteer";
import { writeImageByElement, writeJsonFile } from "@lib/file";
import path from "path";

import sleep from "@lib/sleep";
import { $, $$ } from "@lib/selector";
import { koNameToEnName } from "@constants/column_name_map";
import { iterateAllBills } from "@scripts/utils/bills";
import chalk from 'chalk';

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

export async function iterateCandidatesInPage(page: Page, browser: Browser) {
  const selector = "a.nassem_reslut_pic";
  const elements = await $$(page, selector);

  for (const el of elements) {
    await el.click();
    const newPage = await getCurrentPage(page);
    if (newPage === null) throw Error("newPage가 null일 수 없습니다");

    await createCandidateInfoFromPage(newPage, browser);

    await newPage.close();
  }
}

function getCurrentPage(page: Page) {
  return new Promise((resolve: Handler<Page | null>) =>
    page.on("popup", resolve)
  );
}

async function createCandidateInfoFromPage(page: Page, browser: Browser) {
  if (!page) return browser.close;

  await page.setViewport({ width: 1920, height: 1080 });
  await sleep(1000);
  const koName = await getKoNameFromHTML(page);
  console.log(chalk.red(`===========${koName} START=========`))
  const intro = await getIntroFromHTML(page);
  const history = await getHistoryFromHTML(page);
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

  
  console.log(chalk.green('===# 대표의안 START ==='))
  const 의정활동menu = await $(page, "//*[@class='menu']//a[contains(text(),'의정활동')]");
  if(!의정활동menu) throw Error('대표발의 의안을 크롤링하지 못하였습니다.')
  await 의정활동menu.click();
  const bills = await iterateAllBills({browser, page, is대표발의: true});
  console.log(chalk.green('===# 대표의안 END ==='))

  console.log(chalk.greenBright('===# 공동의안 START ==='))
  const 공동발의_의안menu = await $(page, "li[data-id='collabill'] a");
  if(!공동발의_의안menu) throw Error('공동발의 의안을 크롤링하지 못하였습니다.')
  await 공동발의_의안menu.click();

  await page.waitForSelector('tbody#prpl_cont__collabill__list tr', {timeout: 20 * 1000})
  await sleep(2000) // NOTE 스크립트 로드 예방 차원
  const collabills =  await iterateAllBills({browser, page, is대표발의: false});
  console.log(chalk.greenBright('===# 공동의안 END ==='))

  const obj = {
    enName,
    ...intro,
    history,
    koName,
    partyName,
    bills,
    collabills,
  };
  console.log(chalk.red(`이름: ${koName}`), chalk.yellow(`대표법안 길이: ${bills.length}`),'/', chalk.yellow(`공동법안 길이: ${collabills.length}`))

  writeJsonFile({
    obj,
    folderPath: path.resolve(__dirname, `../../data/candidates`),
    fileName: `${enName}.json`,
  });
  console.log(chalk.red(`===========${koName} END=========`))
}

function getHistoryFromHTML(page: Page) {
  return page.$eval("ul.list pre", (el) => {
    const value = el?.innerText;

    return value.replaceAll("\n\n", "\n");
  });
}
function getEnNameFromUrl(page: Page) {
  const arr = page.url().split("/");
  return arr[arr.length - 1];
}

function getKoNameFromHTML(page: Page) {
  return page.$eval("div.mamber_name", (el) => {
    const value = el?.innerText;
    const name = value.split("(")[0];

    return name;
  });
}

function getPartyNameFromHTML(page: Page) {
  return page.$eval("div.member_assem_dang", (el) => {
    const value = el?.innerText;

    return value;
  });
}
