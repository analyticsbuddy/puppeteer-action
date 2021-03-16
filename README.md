# Puppeteer Screenshot Action

This repo started life as a cloned version of [puppeteer-screenshot-action](https://github.com/lannonbr/puppeteer-screenshot-action). I just added a few capabilities that I needed, so all credit goes to the original authors. Note that if you use a self-hosted runner, you'll need to install Chrome, which is pre-installed on the [GitHub-hosted](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners) runner.

## Additions

I added the ability to evaluate scripts via `page.evaluate()`. This is useful if you want to run a script in the context of the page or find the value of a DOM element. The value of the evaluate step is saved to `env.EVALUATE_OUTPUT`.

You can also now specify **devices**; this is useful as part of a matrix strategy to create screenshots for different devices.

If you don't need a screenshot (because you may only be interested in the evaluate output), there is a flag `capture: "true"|"false"`.

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
