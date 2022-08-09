const GetWalletKeysInteractor = require('./wallet/get-wallet-keys')
const BuyJPGListingInteractor = require('./wallet/buy-jpg-listing')
const AnalyzeRuleInteractor = require('./analyze-rule')
const ValidateConfigInteractor = require('./validate-config')
const PrintWalletConfigInteractor = require('./wallet/print-config')
const AdaUtils = require('../utils/ada')
const Logger = require('../utils/logger')
const Settings = require('../config/settings')

let rulesIntervalIDs = []

const startStopBot = () => {
    if (rulesIntervalIDs.length > 0) {
        stop()
    } else {
        start()
    }
}

const start = async () => {
    Logger.log(`Starting CNFT Sniper`)

    if (!ValidateConfigInteractor.validate()) {
        Logger.log('Config is not valid. Cannot start CNFT Sniper.')
        return
    }
    let baseAddr
    try {
        baseAddr = (
            await GetWalletKeysInteractor.call(Settings.mainWalletSeedKey())
        )['baseAddr']
    } catch (e) {
        Logger.log('Error checking seed key')
        return
    }
    Logger.log(`Address to be used: ${baseAddr}`)
    Logger.log('-----Checking Collateral-----')
    const collateral = await BuyJPGListingInteractor.fetchCollateralSet(
        baseAddr
    )
    if (!collateral) {
        Logger.log('No Collateral Set. Cannot start CNFT Sniper')
        return
    } else {
        Logger.log(`Collateral set: ${AdaUtils.lovelaceToADA(collateral)} ADA`)
    }

    const mainWalletbalance =
        await PrintWalletConfigInteractor.getBalanceByAddress(baseAddr)
    Logger.log(`Balance: ${mainWalletbalance} ADA`)

    logSettings()

    Logger.log(`CNFT Sniper started`)
    const collectionRules = Settings.rules
    collectionRules.forEach((rule) => {
        triggerRuleAnalysis(rule)
    })
}

const stop = () => {
    Logger.log(`Stoping CNFT Sniper.`)
    for (const ruleIntervalID of rulesIntervalIDs) {
        clearInterval(ruleIntervalID)
    }
    rulesIntervalIDs = []
}

const triggerRuleAnalysis = (rule) => {
    const intervalID = setInterval(async () => {
        try {
            await AnalyzeRuleInteractor.call(rule)
        } catch (exception) {
            Logger.log(`Error occured during ${rule} analyzis: ${exception}`)
        }
    }, 5000)
    rulesIntervalIDs.push(intervalID)
}

const logSettings = () => {
    Logger.log('-----Settings-----')
    Logger.log(`Test Mode: ${Settings.isTestMode() ? 'ON' : 'OFF'}`)
    Logger.log(
        `Notifications: ${Settings.isDiscordNotificationsOn() ? 'ON' : 'OFF'}`
    )
    Logger.log(`Debug: ${Settings.isDebug() ? 'ON' : 'OFF'}`)
}

module.exports = { start, startStopBot }
