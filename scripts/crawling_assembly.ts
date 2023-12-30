import puppeteer from "puppeteer";
import sleep from "@lib/sleep";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
  );

  await page.setViewport({ width: 1080, height: 1024 });

  const links = ".nassem_reslut_pic";
  const elements = await page.$$(links);
  console.log("elements.length : ", elements.length);

  await elements[0].click();
  await sleep(5000);

  await browser.close();
})();
