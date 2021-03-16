const core = require("@actions/core");
const puppeteer = require("puppeteer-core");
// const artifact = require('@actions/artifact');
const io = require("@actions/io");
const os = require("os");
const path = require("path");
const devices = require('./devices')

function getChromePath() {
  let browserPath;

  if (os.type() === "Windows_NT") {
    // Chrome is usually installed as a 32-bit application, on 64-bit systems it will have a different installation path.
    const programFiles =
      os.arch() === "x64"
        ? process.env["PROGRAMFILES(X86)"]
        : process.env.PROGRAMFILES;
    browserPath = path.join(
      programFiles,
      "Google/Chrome/Application/chrome.exe"
    );
  } else if (os.type() === "Linux") {
    browserPath = "/usr/bin/google-chrome";
  } else if (os.type() === "Darwin") {
    browserPath =
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }

  if (browserPath && browserPath.length > 0) {
    return path.normalize(browserPath);
  }

  throw new TypeError(`Cannot run action. ${os.type} is not supported.`);
}

(async () => {
  try {
    let AsyncFunction = Object.getPrototypeOf(async () => null).constructor
    await io.mkdirP(`${process.env.GITHUB_WORKSPACE}/screenshots/`);

    const url = core.getInput("url");

    const timestamp = new Date().getTime();
    // const width = parseInt(core.getInput("width"));
    // const height = parseInt(core.getInput("height"));
    const fullPage = core.getInput("fullPage") === "true";
    const capture = core.getInput("capture") === "true";
    const device = core.getInput("device") !== "false" ? core.getInput("device") : null;
    const doesDeviceExist = devices.devices.map(dev => dev.name).includes(device)
    const sanitizedDevice = doesDeviceExist ? "_" + device.split(' ').join('_') : ''
    const screenshotName =
      core.getInput("screenshotName") !== "false"
        ? core.getInput("screenshotName")
        : `screenshot-${timestamp + sanitizedDevice}.png`;
    const evalScript = core.getInput("evaluate") !== "false" ? core.getInput("evaluate") : null;
    // const destFolder = process.env.RUNNER_TEMP;
    const destFolder = `${process.env.GITHUB_WORKSPACE}/screenshots`
    const dest = path.join(destFolder, screenshotName);
    const browser = await puppeteer.launch({
      executablePath: getChromePath()   // defaultViewport: { width, height },
    });
    const page = await browser.newPage();
    if (doesDeviceExist) {
      const deviceEmulated = puppeteer.devices[device];
      console.log(`emulating ${device}`)
      await page.emulate(deviceEmulated)
    };
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    // await page.waitFor(3000);
    let script_output
    if (evalScript) {
      // const ga_results = await page.evaluate(() => window.gaData)
      let fn = new AsyncFunction('page', evalScript)
      script_output = await fn(page)
    }
    if (capture) {
      await page.screenshot({
        fullPage,
        path: dest,
      })
    }
    await browser.close();
    // const artifactClient = artifact.create();
    // const artifactName = screenshotName.substr(0, screenshotName.lastIndexOf('.'));
    // const uploadResult = await artifactClient.uploadArtifact(artifactName, [dest], destFolder);
    core.exportVariable("TIMESTAMP", timestamp);
    core.exportVariable("DOWNLOAD_PATH", dest);
    core.exportVariable("EVALUATE_OUTPUT", script_output);
    core.setOutput('download-path', dest)
    core.debug(process.env)
  } catch (error) {
    core.setFailed(`Failed to run action. ${error}`);
    process.exit(1);
  }
})();
