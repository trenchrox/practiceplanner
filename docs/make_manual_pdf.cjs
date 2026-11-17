/* Rendera docs/manual.html till docs/practiceplanner-manual.pdf.
 *
 *   npm i playwright            # engångsinstallation, bara för dokumentationen
 *   node docs/make_manual_pdf.cjs
 *
 * Sidstorlek och marginaler kommer från @page-reglerna i manual.html.
 * Utan Playwright: öppna manual.html i en webbläsare och skriv ut till PDF.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const CHROMIUM = '/opt/pw-browsers/chromium';

(async () => {
  const src = path.join(HERE, 'manual.html');
  const out = path.join(HERE, 'practiceplanner-manual.pdf');
  const browser = await chromium.launch(
    fs.existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {});
  const page = await browser.newPage();
  await page.goto('file://' + src);
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  await browser.close();
  console.log('Skrev', out, fs.statSync(out).size, 'byte');
})();
