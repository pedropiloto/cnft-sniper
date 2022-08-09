const Settings = require('../app/config/settings')

require('dotenv').config()

Settings.loadConfigByConfigsFile()

const BotInteractor = require('../app/interactors/bot')

BotInteractor.start()
