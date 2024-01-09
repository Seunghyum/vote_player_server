import puppeteer from "puppeteer";
import { removeDirIfExist, writeJsonFile } from "@lib/file";
import path from "path";
import fs from "fs";
import { iterateAllBills } from "@scripts/utils/bills";

const 대표법안페이지 =
  "https://www.assembly.go.kr/portal/assm/assmPrpl/prplMst.do?monaCd=WCD5518S&st=21&viewType=CONTBODY";

(async () => {
  const billsFolderPath = path.resolve(__dirname, "../../samples/bills");
  removeDirIfExist(billsFolderPath);

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });
  try {
    const page = await browser.newPage();
    await page.goto(대표법안페이지);

    await page.setViewport({ width: 1920, height: 1080 });

    const bills = await iterateAllBills(page);

    writeJsonFile({
      obj: bills,
      folderPath: path.resolve(__dirname, "../../samples/bills"),
      fileName: "sample_bills.json",
    });

    if (bills.length === 0)
      throw Error("법안을 하나도 크롤링 하지 못하였습니다");
    else console.log(`총 ${bills.length}개의 법안을 크롤링했습니다.`);
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
})();
