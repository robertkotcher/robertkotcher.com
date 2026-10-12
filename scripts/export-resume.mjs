import { chromium } from "playwright";
import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";

await mkdir("public/qr", { recursive: true });
const links = {
  "cat-project": "https://photos.app.goo.gl/2DL7bfRMNnXi1g3d8",
  "paper-0": "https://www.researchgate.net/publication/262292364_Cross-origin_pixel_stealing_Timing_attacks_using_CSS_filters",
  "paper-1": "https://www.researchgate.net/publication/266022550_OAuth_Demystified_for_Mobile_Application_Developers",
};
for (const [name, url] of Object.entries(links)) {
  await QRCode.toFile(`public/qr/${name}.png`, url, { width: 400, margin: 4, errorCorrectionLevel: "M" });
}

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
