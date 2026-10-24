# Résumé

`resume.html` is the source for `public/assets/sam-stringer-hye-resume.pdf`. It uses the site's DM Sans files and prints to one Letter page.

To regenerate, open the file in headless Chromium and print with the page's CSS size, for example with Playwright:

```js
await page.goto('file://' + path.resolve('scripts/resume/resume.html'))
await page.evaluate(() => document.fonts.ready)
await page.pdf({ path: 'public/assets/sam-stringer-hye-resume.pdf', format: 'Letter', printBackground: true, preferCSSPageSize: true })
```

Check that it stays on one page. Facts must match the site and its case studies.
