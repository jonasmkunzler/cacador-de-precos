"use server"

import puppeteer from 'puppeteer'

const { BLESS_TOKEN } = process.env

const runBrowserles = async () => await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
  })

export async function getPagePupper(url: string) {
    const browser = await runBrowserles();
    const page = await browser.newPage();

    await page.goto(url);

    const content = await page.evaluate(() => document.body.innerHTML);

    await browser.close();

    return content;
}

