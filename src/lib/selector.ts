import { Page, WaitForSelectorOptions } from "puppeteer";

export async function $(
  page: Page,
  selector: string,
  options: WaitForSelectorOptions = { timeout: 10000, visible: true }
) {
  try {
    await page.waitForSelector(selector, options);
    return await page.$(selector);
  } catch (err) {
    return null;
  }
}
export async function $$(
  page: Page,
  selector: string,
  options: WaitForSelectorOptions = { timeout: 10000 }
) {
  try {
    await page.waitForSelector(selector, options);
    return await page.$$(selector);
  } catch (err) {
    return [];
  }
}

export async function $evalInnerHTML(page:Page, selector: string)  {
  return page.$eval(selector, (el) => el.innerHTML)

}