const Settings = require('../../config/settings')

const getBalanceByAddress = async (address) => {
    const data = (await Settings.blockfrostAPI().addressesExtended(address))[
        'amount'
    ]
    return (
        Number(
            data
                .filter((x) => x['unit'] === 'lovelace')
                .map((x) => x['quantity'])[0]
        ) / 1000000
    )
}

module.exports = { getBalanceByAddress }
