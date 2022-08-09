const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))
const Settings = require('../config/settings')
const Logger = require('../utils/logger')

const submitTransaction = async (tx) => {
    const submitTxEndpoint = Settings.cardanoSubmitApiUrl()

    Logger.log(`submitting transaction to ${submitTxEndpoint}`)

    const result = await fetch(submitTxEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/cbor' },
        body: Buffer.from(tx, 'hex'),
    })

    if (result.ok) {
        return result.json()
    }
    Logger.log(await result.json())
    throw Error(
        'Something went wrong submitting the transaction',
        JSON.stringify(await result.json())
    )
}

const sendTransaction = async (CBORTx) => {
    try {
        Logger.log(`submitting transaction to Blockfrost`)
        return Settings.blockfrostAPI().txSubmit(CBORTx)
    } catch (e) {
        Logger.log(e)
    }
}

module.exports = { submitTransaction, sendTransaction }
