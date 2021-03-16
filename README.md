# Puppeteer Screenshot Action

A GitHub Action to open Puppeteer and take a screenshot of the page. The screenshot will be saved to `$GITHUB_WORKSPACE/screenshots/screenshot-${timestamp}.png` where the timestamp is the unix timestamp of when the image was taken.
You can change the name of the saved screenshot in the config.

## Additions

This forked repo adds the ability to evaluate scripts via `page.evaluate()`. This is useful if you want to run a script in the context of the page or find the value of a DOM element. The value of the evaluate step is saved to `env.EVALUATE_OUTPUT`. You can also now specify **devices**; this is useful as part of a matrix strategy. If you don't need a screenshot (because you may only be interested in the evaluate output), there is a flag `capture: "true"|"false"`.

```yaml
jobs:
  take-screenshot:
    strategy:
      matrix:
        device: ["iPad","iPhone 8"]
    runs-on: ubuntu-latest
    steps:
      - name: Take screenshot
        id: take-screenshot
        uses: mwhitaker/puppeteer-screenshot-action@master
        with:
          url: https://github.com
          capture: "true"
          device: ${{ matrix.device }}
          fullPage: ${{ github.event.inputs.fullPage }}
          evaluate: |
            return await page.evaluate(() => document.querySelector('h2.h5-mktg-fluid').innerText)
      - name: document output
        run: |-
          echo '${{ env.EVALUATE_OUTPUT }}'
```
