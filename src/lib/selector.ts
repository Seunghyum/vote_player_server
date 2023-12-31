import { Page, WaitForSelectorOptions } from "puppeteer";

export async function $(
  page: Page,
  selector: string,
  options: WaitForSelectorOptions = { timeout: 10000 }
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
