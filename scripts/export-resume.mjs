import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Run against the local site after résumé changes: npm run export:resume
const origin = process.env.RESUME_ORIGIN || "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  const outputs = [
    { route: "/print", file: "robert-kotcher-resume.pdf", name: "resumePdfUrl" },
    { route: "/directory/full-stack-product-engineering/print", file: "robert-kotcher-full-stack-product-engineering.pdf", name: "fullStackProductPdfUrl" },
  ];
  const exports = [];
  for (const { route, file, name } of outputs) {
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: `public/${file}`, format: "A4", preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
    const revision = createHash("sha256").update(await readFile(`public/${file}`)).digest("hex").slice(0, 12);
    exports.push(`export const ${name} = "/${file}?v=${revision}";`);
  }
  await writeFile("app/resumePdf.ts", `// Updated by npm run export:resume whenever the PDFs change.\n${exports.join("\n")}\n`);
} finally {
  await browser.close();
}
