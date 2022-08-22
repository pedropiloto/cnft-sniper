const Settings = require('../../config/settings')

async function isHoldingNFT(addr, policy) {
    const assets = await Settings.blockfrostAPI().addressesExtended(addr)

    return (
        assets.amount.filter(
            (x) =>
                x.unit.startsWith(policy) && x.quantity > 0
        ).length > 0
    )
}

async function plans(addr, policy) {
    const assets = await Settings.blockfrostAPI().addressesExtended(addr)

    const assetsIDs = (
        assets.amount.filter(
            (x) =>
                x.unit.startsWith(policy) && x.quantity > 0
        ).map(x=>x['unit'])
    )
    console.log(assetsIDs)
    const plans = []
    for (const assetID of assetsIDs) {
        const metadata = await Settings.blockfrostAPI().assetsById(assetID)
        console.log(metadata)
        plans.push(metadata['onchain_metadata']['name'])
    }
    console.log(plans)
}

module.exports = { isHoldingNFT, plans }
