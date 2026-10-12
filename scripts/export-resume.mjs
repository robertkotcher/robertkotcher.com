import { chromium } from "playwright";

// Run against the local site after résumé changes: npm run export:resume
const origin = process.env.RESUME_ORIGIN || "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  await page.goto(`${origin}/print`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: "public/robert-kotcher-resume.pdf",
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
  });
} finally {
  await browser.close();
}
