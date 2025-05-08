/* 국회의원_현황_조회 api */

import puppeteer from "puppeteer";
import { iteratsBillssInPage } from "@scripts/utils/bills";

const 대표법안페이지 = "https://www.assembly.go.kr/portal/assm/assmPrpl/prplMst.do?monaCd=6AU2417B&st=22&viewType=CONTBODY";

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
    });
    try {
        const page = await browser.newPage();
        await page.goto(대표법안페이지, {waitUntil: 'load'});
        await page.setViewport({ width: 1920, height: 1080 });
        await iteratsBillssInPage({browser, page, is대표발의: false})

    } catch (err) {
        throw err;
    } finally {
        await browser.close();
    }
})();

