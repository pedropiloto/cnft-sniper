const Logger = require('../utils/logger')
const Settings = require('../config/settings')

const validate = () => {
    try {
        const rules = Settings.rules
        const settings = Settings.settings

        if (!rules || !settings) {
            return false
        }

        if (!validateRules(rules)) {
            Logger.log('Config Error - Rules not valid.')
            return false
        }

        if (!validateSettings(settings)) {
            Logger.log('Config Error - Settings not valid.')
            return false
        }
        return true
    } catch (e) {
        Logger.log(`ERROR validating config ${e}`)
        return false
    }
}

const validateRules = (rules) => {
    if (rules.length === 0) {
        return false
    }
    if (rules.length >= 5) {
        Logger.log('Config Error - Maximum of 5 rules allowed.')
        return
    }
    for (const rule of rules) {
        if (!rule['name'] || !rule['policy_id']) {
            return false
        }
        if (rule['under_value' && rule['under_value'] <= 0]) {
            return false
        }
    }
    return true
}

const validateSettings = (settings) => {
    const isTestMode = settings['test_mode'] === true
    const blockfrostProjectId = settings['blockfrost_project_id']
    if (!blockfrostProjectId) {
        Logger.log('Missing blockfrost_project_id field on the settings')
        return false
    }

    if (!isTestMode) {
        const mainWallet = settings['main_wallet']
        if (!mainWallet) {
            Logger.log('Missing main_wallet field on the settings')
            return false
        }

        const seedKey = mainWallet['seed_key']
        if (!seedKey || seedKey.length <= 1) {
            Logger.log('There are issues in the seed_key field')
            return false
        }
    }

    return true
}

module.exports = { validate }
