const NodeTtl = require('node-ttl')
const Mutex = require('async-mutex').Mutex
const withTimeout = require('async-mutex').withTimeout

const JpgGateway = require('../gateways/jpg-gateway')
const DiscordGateway = require('../gateways/discord-gateway')
const {
    applyUnderPreviousCollectionFloor,
    applyUnderPreviousRuleFloor,
    applyUnderValue,
} = require('./rules')
const { lovelaceToADA } = require('../utils/ada')
const BuyJPGListingInteractor = require('./wallet/buy-jpg-listing')
const Logger = require('../utils/logger')
const Settings = require('../config/settings')

const collectionFloors = new NodeTtl()
const ruleFloors = new NodeTtl()
const listingsBought = new NodeTtl()
const buyLock = withTimeout(new Mutex(), 20000)

const call = async (rule) => {
    const floor = lovelaceToADA(
        (await JpgGateway.getCollectionFloor(rule['policy_id'])).data['floor']
    )
    const assets = (
        await JpgGateway.getCollectionItems(
            rule['policy_id'],
            JSON.stringify(rule['traits_filter'])
        )
    ).data['tokens']
    const assetPrices = assets
        .map((x) => {
            return {
                collection_name: x['collections']['display_name'],
                asset_id: x['asset_id'],
                price: lovelaceToADA(Number(x['listing_lovelace'])),
                has_pending_transaction: x['has_pending_transaction'],
            }
        })
        .filter((x) => x['has_pending_transaction'] === false && x['price'] > 0)
        .sort(compareRules)
        .slice(0, 2)

    const collectionFloorKey = `${rule['policy_id']}`
    const ruleFloorKey = `${rule['name']}`

    const previousCollectionFloor = collectionFloors.get(collectionFloorKey)
    const previousRuleFloor = ruleFloors.get(ruleFloorKey)

    collectionFloors.push(collectionFloorKey, floor, null, 300)
    ruleFloors.push(ruleFloorKey, assets[0], null, 300)

    //apply rule under_previous_collection_floor
    const collectionFloorResult = applyUnderPreviousCollectionFloor(
        rule,
        previousCollectionFloor,
        assetPrices
    )

    const ruleFloorResult = applyUnderPreviousRuleFloor(
        rule,
        previousRuleFloor,
        assetPrices
    )

    const underValueResult = applyUnderValue(rule, assetPrices)

    if (Settings.isDiscordNotificationsOn()) {
        triggerNotifications(
            collectionFloorResult,
            ruleFloorResult,
            underValueResult
        )
    }

    const assetsToBuy = collectionFloorResult
        .concat(ruleFloorResult)
        .concat(underValueResult)

    const assetsToBuyWithListings = await Promise.all(
        assetsToBuy.map(async (asset) => {
            const assetData = (await JpgGateway.getAsset(asset['asset_id']))
                .data
            return {
                ...asset,
                listings: assetData['listings'].map((x) => x['id']),
            }
        })
    )

    const assetsWithMultipleListings = assetsToBuyWithListings.filter(
        (x) => x['listings'].length !== 1
    )

    if (assetsWithMultipleListings.length > 0) {
        Logger.log('ERROR - Assets with multiple listings.')
        Logger.log(
            `ERROR - ASSETS WITH MUTIPLE LISTINGS
            ${assetsWithMultipleListings}`,
            false
        )
    }

    let listingsToBuy = [
        ...new Set(
            assetsToBuyWithListings
                .filter((x) => x['listings'].length === 1)
                .map((x) => x['listings'][0])
        ),
    ]
    listingsToBuy = listingsToBuy.filter((x) => !!x && !listingsBought.get(x))

    if (!Settings.isTestMode()) {
        for (const listingId of listingsToBuy) {
            const release = await buyLock.acquire()
            try {
                const success = await BuyJPGListingInteractor.call(listingId)
                if (success) {
                    listingsBought.push(listingId, 1, null, 30000)
                }
            } finally {
                release()
            }
        }
    }
}

const compareRules = (ruleA, ruleB) => {
    if (ruleA['price'] < ruleB['price']) {
        return -1
    }
    if (ruleA['price'] > ruleB['price']) {
        return 1
    }
    // a must be equal to b
    return 0
}

const triggerNotifications = (
    collectionFloorResult,
    ruleFloorResult,
    underValueResult
) => {
    collectionFloorResult.forEach((element) => {
        DiscordGateway.PublishDealDiscordAlert(
            'Under Collection Floor',
            element
        ).catch((e) => {
            Logger.log(`FAILED NOTIFICATIONS:${e}`, false)
        })
    })

    ruleFloorResult
        .forEach((element) => {
            DiscordGateway.PublishDealDiscordAlert('Under Rule Floor', element)
        })
        .catch((e) => {
            Logger.log(`FAILED NOTIFICATIONS:${e}`, false)
        })

    underValueResult
        .forEach((element) => {
            DiscordGateway.PublishDealDiscordAlert('Under Value', element)
        })
        .catch((e) => {
            Logger.log(`FAILED NOTIFICATIONS:${e}`, false)
        })
}

module.exports = { call }
