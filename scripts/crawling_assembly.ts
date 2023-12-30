import puppeteer, { Handler, Page } from "puppeteer";
import sleep from "@lib/sleep";
import { writeJsonFile } from "@lib/file";
import path from "path";

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.goto(
    "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
  );

  await page.setViewport({ width: 1880, height: 1024 });

  const links = "a.nassem_reslut_pic img";
  const elements = await page.$$(links);

  const waitForWindow = new Promise((resolve: Handler<Page | null>) =>
    page.on("popup", resolve)
  );

  await elements[0].evaluate((b) => b.click());
  const newPage = await waitForWindow;

  if (!newPage) return;
  const intro = await getIntroFromHTML(newPage);
  const history = await getHistoryFromHTML(newPage);
  const enName = await getEnNameFromHTML(newPage);

  const obj = {
    enName,
    intro,
    history,
  };

  writeJsonFile({
    obj,
    folderPath: path.resolve(__dirname, "../data/candidates"),
    fileName: `${enName.enName}.json`,
    dateTime: new Date(),
  });

  await sleep(5000);

  await browser.close();
})();

function getIntroFromHTML(page: Page) {
  return page.$$eval("ul.list li", (list) => {
    const obj: { [key: string]: string | undefined } = {};

    for (const item of list) {
      const key = item.querySelector("dt")?.innerText;
      const value = item.querySelector("dd")?.innerText;
      if (key !== undefined) {
        obj[key] = value;
      }
    }
    return obj;
  });
}

function getHistoryFromHTML(page: Page) {
  return page.$eval(".profile pre", (el) => {
    const value = el?.innerText;

    return { "주요 약력": value };
  });
}

function getEnNameFromHTML(page: Page) {
  return page.$eval(".tit span.sm", (el) => {
    const value = el?.firstChild?.nodeValue;

    return { enName: value?.replace(/\s/g, "") };
  });
}
