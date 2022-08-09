const fs = require('fs')
const { resolve } = require('path')
const { BlockFrostAPI } = require('@blockfrost/blockfrost-js')

class Settings {
    constructor() {}

    loadConfigByConfigsJson = (configsJson) => {
        this.rules = configsJson['rules']
        this.settings = configsJson['settings']
        this.volumeWallets = configsJson['volumeWallets']
    }

    loadConfigByConfigsFile = () => {
        const configsPath = resolve(__dirname, '../../config.json')

        this.rules = JSON.parse(
            fs.readFileSync(configsPath, { encoding: 'utf8', flag: 'r' })
        )['rules']

        this.settings = JSON.parse(
            fs.readFileSync(configsPath, { encoding: 'utf8', flag: 'r' })
        )['settings']

        this.volumeWallets = JSON.parse(
            fs.readFileSync(configsPath, { encoding: 'utf8', flag: 'r' })
        )['volume_wallets']
    }

    isDiscordNotificationsOn = () => !!this.settings['discord_webhook']

    discordWebhook = () => !!this.settings['discord_webhook']

    blockfrostProjectId = () => this.settings?.blockfrost_project_id

    blockfrostAPI() {
        return !!this.blockfrostProjectId()
            ? new BlockFrostAPI({
                  projectId: this.blockfrostProjectId(),
              })
            : null
    }

    isTestMode = () => this.settings['test_mode'] === true

    isDebug = () => this.settings['debug'] === true

    mainWalletSeedKey = () => this.settings['main_wallet']['seed_key']

    cardanoSubmitApiUrl = () => this.settings['cardano_submit_api_url']

    volumeWalletSeedKey = (walletName) => {
        const wallet = this.volumeWallets.find((x) => x['name'] === walletName)
        return wallet['seed_key']
    }
}

module.exports = new Settings()
