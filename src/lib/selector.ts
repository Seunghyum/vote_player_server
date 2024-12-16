import { ElementHandle, Page, WaitForSelectorOptions } from "puppeteer";

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

// TS
export async function elementHasClass(
  el: ElementHandle<Element>,
  className: string,
): Promise<boolean> {
  const classNames = (
    await (await el.getProperty('className')).jsonValue()
  ).split(/\s+/);

  return classNames.includes(className);
}