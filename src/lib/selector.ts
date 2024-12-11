import { Page, WaitForSelectorOptions } from "puppeteer";

export async function $(
  page: Page,
  selector: string,
  options: WaitForSelectorOptions = { timeout: 10000, visible: true }
) {
  try {
    let sel = selector
    if(selector.startsWith('//')) {
      sel = `::-p-xpath(${sel})`
    }
    await page.waitForSelector(sel, options);
    return await page.$(sel);
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
    let sel = selector
    if(selector.startsWith('//')) {
      sel = `::-p-xpath(${sel})`
    }
    await page.waitForSelector(sel, options);
    return await page.$$(sel);
  } catch (err) {
    return [];
  }
}
