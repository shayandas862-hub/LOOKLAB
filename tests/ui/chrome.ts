// The Chrome every browser test uses: the one installed on the Mac, headless, with no network (P4, zero live calls).
// Every host name resolves to nothing except the engine's 127.0.0.1, and each page aborts any request that is not
// for 127.0.0.1, data: or blob:, so neither a page nor Chrome itself can reach the Anthropic API or anything else.
import { chromium, type Browser, type BrowserContextOptions, type Page } from 'playwright-core';

export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LOCAL = /^(data:|blob:|about:|https?:\/\/127\.0\.0\.1[:/])/;

export function launchChrome(args: string[] = []): Promise<Browser> {
  return chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1', ...args],
  });
}

/** A page that can only talk to this machine. */
export async function offlinePage(browser: Browser, opts: BrowserContextOptions = {}): Promise<Page> {
  const page = await browser.newPage(opts);
  await page.route('**/*', (route) => (LOCAL.test(route.request().url()) ? route.continue() : route.abort('internetdisconnected')));
  return page;
}

/** The console line Chrome writes for a request the offline page refused (Google Fonts, a test's own probe). */
export const blockedByOffline = (text: string) => text.includes('net::ERR_INTERNET_DISCONNECTED');
