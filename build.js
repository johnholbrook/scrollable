const packager = require('electron-packager')

async function bundleElectronApp(options) {
  const appPaths = await packager(options)
  console.log(`Electron app bundles created:\n${appPaths.join("\n")}`)
}

let options = {
    dir: ".",
    out: "./dist",
    overwrite: true,
    platform: ["darwin", "win32"],
    arch: ["x64", "arm64"],
    appBundleId: "com.fll-timer.scrollable",
    appCopyright: `Copyright © 2020-${new Date().getFullYear()} John Holbrook`,
    icon: "./build/app-icon.png",
    asar: false
}


bundleElectronApp(options);