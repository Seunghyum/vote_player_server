import { filenameTime, removeDirIfExist, zipDirectory } from "@lib/file";
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";
import { iterateCandidatesInPage } from "@scripts/utils/candidates";
import { $, $$ } from "@lib/selector";

const 의원검색페이지 =
  "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do";

(async () => {
  const candidatesFolderPath = path.resolve(
    __dirname,
    "../data/candidates"
  );
  removeDirIfExist(candidatesFolderPath);

  const browser = await puppeteer.launch({
    // headless: false,
    // slowMo: 10,
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(의원검색페이지, {timeout: 60 * 1000, waitUntil: 'networkidle0'});
    const 사진보기btn = await $(page, '//*[@id="tab-btn-sect"]//a[contains(text(), "사진보기")]');
    if(!사진보기btn) throw Error('사진보기btn이 없습니다')
    await 사진보기btn.click();
    const selector = "a.nassem_reslut_pic img";
    const elements = await $$(page, selector);
    const candidatesPerPage = elements.length;

    // 첫페이지 크롤링
    if (elements.length === 0)
      throw Error("첫 페이지의 의원 수가 0이 될 수 없습니다");

    //페이지네이션 순회
    let numOfPagination = 0;
    let length = 11;
    for (let i = 0; i < length; i++) {
      // 의원 순회
      await iterateCandidatesInPage(page, browser);
      const selector = "#pic-sect-pager strong + a.page-number";
      const p = await $(page, selector, { timeout: 5000 });
      console.log("page : ", i + 2);
      if (p) {
        await p.click();
      } else {
        numOfPagination = i + 1;
        break;
      }
    }

    const numOfCandidates = await fs.readdirSync(candidatesFolderPath).length;

    const zipPath = path.resolve(
      __dirname,
      `../data/candidates-${filenameTime}.zip`
    );
    await zipDirectory(candidatesFolderPath, zipPath);
    if (numOfCandidates !== 300)
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
