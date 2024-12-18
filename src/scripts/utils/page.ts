import { Browser, Page, Target } from "puppeteer";

export const getNewBrowserTab = (browser: Browser) => {
    let resultPromise: (page: Page | Promise<Page>) => void;

    async function onTargetcreatedHandler(target: Target) {
    if (target.type() === 'page') {
        const newPage = await target.page();

        if (newPage === null) throw Error('newPage was null?');

        const newPagePromise = new Promise<Page>((resolve) =>
            newPage.once('domcontentloaded', () => {
                resolve(newPage);
            })
        );

        const isPageLoaded = await newPage.evaluate(() => document.readyState);

        browser.off('targetcreated', onTargetcreatedHandler); // unsubscribing

        return isPageLoaded.match('complete|interactive') ? resultPromise(newPage) : resultPromise(newPagePromise);
    }
    }

    return new Promise<Page | Promise<Page>>((resolve) => {
        resultPromise = resolve;
        browser.on('targetcreated', onTargetcreatedHandler);
    });
};