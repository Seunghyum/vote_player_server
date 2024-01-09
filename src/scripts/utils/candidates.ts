import type { Browser, Handler, Page } from "puppeteer";
import { writeImageByElement, writeJsonFile } from "@lib/file";
import path from "path";
import fs from "fs";
import sleep from "@lib/sleep";
import { $, $$ } from "@lib/selector";
import { koNameToEnName } from "@constants/column_name_map";
import { iterateAllBills } from "@scripts/utils/bills";

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
  const selector = "a.nassem_reslut_pic img";
  const elements = await $$(page, selector);

  console.log("elements length : ", elements.length);
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

  const bills = await iterateAllBills(page);

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
