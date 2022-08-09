require('dotenv').config()
const webhook = require('webhook-discord')
const Settings = require('../config/settings')

const PublishDealDiscordAlert = async (dealType, asset) => {
    const Hook = new webhook.Webhook(Settings.discordWebhook())
    Hook.warn(`Rule - ${dealType}`, JSON.stringify(asset))
}

module.exports = { PublishDealDiscordAlert }
