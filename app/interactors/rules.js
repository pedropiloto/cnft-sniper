const Logger = require('../utils/logger')
const Settings = require('../config/settings')

const applyUnderPreviousCollectionFloor = (
    rule,
    previousCollectionFloor,
    assets
) => {
    const result = []
    if (
        rule['under_previous_collection_floor'] &&
        previousCollectionFloor &&
        Number(previousCollectionFloor) > 0
    ) {
        const limitPreviousCollection =
            (Number(previousCollectionFloor) *
                (100 - Number(rule['under_previous_collection_floor']))) /
            100

        assets.forEach((element) => {
            const message = `${rule['name']} - collection floor - ${Number(
                element['price']
            )} vs ${limitPreviousCollection}`

            if (Settings.isDebug()) {
                Logger.log(message)
            }

            if (Number(element['price']) <= limitPreviousCollection) {
                result.push(element)
            }
        })
    }
    return result
}

const applyUnderPreviousRuleFloor = (rule, previousRuleFloor, assets) => {
    const result = []
    if (
        rule['under_previous_rule_floor'] &&
        previousRuleFloor &&
        Number(previousRuleFloor) > 0
    ) {
        const limitPreviousRule =
            (Number(previousRuleFloor) *
                (100 - Number(rule['under_previous_rule_floor']))) /
            100

        assets.forEach((element) => {
            const message = `${rule['name']} - previous floor - ${Number(
                element['price']
            )} vs ${limitPreviousRule}`
            if (Settings.isDebug()) {
                Logger.log(message)
            }

            if (Number(element['price']) <= limitPreviousRule) {
                result.push(element)
            }
        })
    }
    return result
}

const applyUnderValue = (rule, assets) => {
    const result = []
    const underValue = rule['under_value']
    if (underValue) {
        assets.forEach((element) => {
            const message = `${rule['name']} - under value - ${Number(
                element['price']
            )} vs ${underValue}`
            if (Settings.isDebug()) {
                Logger.log(message)
            }
            if (Number(element['price']) <= underValue) {
                result.push(element)
            }
        })
    }
    return result
}

module.exports = {
    applyUnderPreviousCollectionFloor,
    applyUnderPreviousRuleFloor,
    applyUnderValue,
}
