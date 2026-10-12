import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

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
  const revision = createHash("sha256").update(await readFile("public/robert-kotcher-resume.pdf")).digest("hex").slice(0, 12);
  await writeFile("app/resumePdf.ts", `// Updated by npm run export:resume whenever the PDF changes.\nexport const resumePdfUrl = "/robert-kotcher-resume.pdf?v=${revision}";\n`);
} finally {
  await browser.close();
}
