// "afterSign": "./afterSignHook.js",

require('dotenv').config();
const fs = require('fs');
const path = require('path');
var electron_notarize = require('electron-notarize');

function getBuilderFlags() {
    // https://www.electron.build/cli
    const winFlags = ['--win', '-w', '--windows']
    const macFlags = ['--mac', '-m', '-o', '--macos']
    const cmd = process.argv

    console.log('Checking cmd arguments:', cmd)

    const result = {}
    result.isWinOn = cmd.some(flag => winFlags.includes(flag))
    result.isMacOn = cmd.some(flag => macFlags.includes(flag))
    return result
}

module.exports = async function (params) {
    const flags = getBuilderFlags()

    if (flags.isMacOn) {

        if (process.platform !== 'darwin') {
            return;
        }

        console.log('afterSign hook triggered', params);

        let appId = 'com.moonflier.cnft-sniper'

        let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
        if (!fs.existsSync(appPath)) {
            console.log('skip');
            return;
        }

        console.log(`Notarizing ${appId} found at ${appPath}`);

        try {
            await electron_notarize.notarize({
                appBundleId: appId,
                appPath: appPath,
                appleId: process.env.APPLE_ID,
                appleIdPassword: process.env.APPLE_ID_PASSWORD,
            });
        } catch (error) {
            console.error(error);
        }

        console.log(`Done notarizing ${appId}`);
    }
};