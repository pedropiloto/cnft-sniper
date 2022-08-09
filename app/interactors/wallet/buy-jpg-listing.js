const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs')
const Buffer = require('buffer').Buffer
const GetWalletKeysInteractor = require('./get-wallet-keys')
const JpgGateway = require('../../gateways/jpg-gateway')
const SubmitTxGateway = require('../../gateways/submit-tx-api')
const Settings = require('../../config/settings')
const Logger = require('../../utils/logger')

const call = async (listingId) => {
    Logger.log(`BUYING ${listingId}`)

    const mainWalletSeedKey = Settings.mainWalletSeedKey()
    const { prvKey, baseAddr } = GetWalletKeysInteractor.call(mainWalletSeedKey)

    //----find collateral
    const utxos = await getUtxos(baseAddr)
    const collateralUtxo = getCollateral(utxos)

    if (!collateralUtxo) {
        throw Error('No collateral Tx found')
    }

    const convertedCollateralUtxo = Buffer.from(
        collateralUtxo.to_bytes(),
        'hex'
    ).toString('hex')

    const convertedUtxos = utxos.map((utxo) =>
        Buffer.from(utxo.to_bytes(), 'hex').toString('hex')
    )

    const filteredConvertedUtxos = convertedUtxos.filter(
        (x) => x !== convertedCollateralUtxo
    )

    let rawTxCbor

    try {
        const response = await JpgGateway.buildBuyTransaction(
            filteredConvertedUtxos,
            [convertedCollateralUtxo],
            baseAddr,
            listingId
        )
        rawTxCbor = response.data['cbor']
    } catch (error) {
        Logger.log('Error requesting transaction building to jpg.store')
        Logger.log(JSON.stringify(error.response.data))
        return false
    }

    try {
        let tx = CardanoWasm.Transaction.from_bytes(fromHex(rawTxCbor))

        let signedTx = await signTransaction(tx, prvKey)
        const txHashToRegister = Buffer.from(
            CardanoWasm.hash_transaction(tx.body()).to_bytes(),
            'hex'
        ).toString('hex')

        const customCardanoSubmitApiUrl = Settings.cardanoSubmitApiUrl()
        let txHash
        if (customCardanoSubmitApiUrl) {
            txHash = await SubmitTxGateway.submitTransaction(signedTx)
        } else {
            txHash = await SubmitTxGateway.sendTransaction(signedTx)
        }
        Logger.log(`tx Submited with hash ===> ${txHash}`)
        await JpgGateway.registerTransaction(txHashToRegister, listingId)

        return true
    } catch (e) {
        Logger.log('Error submitting transaction', false)
        Logger.log(e)
        return false
    }
}

const getUtxos = async (senderAddress) => {
    const rawUtxos = await getAddressesUtxosAll(senderAddress)
    const paymentAddr = Buffer.from(
        CardanoWasm.Address.from_bech32(senderAddress).to_bytes(),
        'hex'
    ).toString('hex')

    return rawUtxos.map((utxo) => utxoFromJson(utxo, paymentAddr))
}

async function getAddressesUtxosAll(addr) {
    return Settings.blockfrostAPI().addressesUtxosAll(addr)
}

const utxoFromJson = (output, address) => {
    return CardanoWasm.TransactionUnspentOutput.new(
        CardanoWasm.TransactionInput.new(
            CardanoWasm.TransactionHash.from_bytes(
                Buffer.from(output['tx_hash'] || output['txHash'], 'hex')
            ),
            output.output_index || output.txId
        ),
        CardanoWasm.TransactionOutput.new(
            CardanoWasm.Address.from_bytes(Buffer.from(address, 'hex')),
            assetsToValue(output.amount)
        )
    )
}

const assetsToValue = (assets) => {
    const multiAsset = CardanoWasm.MultiAsset.new()
    const lovelace = assets.find((asset) => asset.unit === 'lovelace')
    const policies = [
        ...new Set(
            assets
                .filter((asset) => asset.unit !== 'lovelace')
                .map((asset) => asset.unit.slice(0, 56))
        ),
    ]
    policies.forEach((policy) => {
        const policyAssets = assets.filter(
            (asset) => asset.unit.slice(0, 56) === policy
        )
        const assetsValue = CardanoWasm.Assets.new()
        policyAssets.forEach((asset) => {
            assetsValue.insert(
                CardanoWasm.AssetName.new(
                    Buffer.from(asset.unit.slice(56), 'hex')
                ),
                CardanoWasm.BigNum.from_str(asset.quantity)
            )
        })
        multiAsset.insert(
            CardanoWasm.ScriptHash.from_bytes(Buffer.from(policy, 'hex')),
            assetsValue
        )
    })
    const value = CardanoWasm.Value.new(
        CardanoWasm.BigNum.from_str(lovelace ? lovelace.quantity : '0')
    )
    if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset)
    return value
}

const signTransaction = async (tx, prvKeysSender) => {
    try {
        const txHash = CardanoWasm.hash_transaction(tx.body())
        const witnesses = tx.witness_set()

        const vkeysWitnesses = CardanoWasm.Vkeywitnesses.new()

        const vkeyWitness = CardanoWasm.make_vkey_witness(txHash, prvKeysSender)
        vkeysWitnesses.add(vkeyWitness)
        witnesses.set_vkeys(vkeysWitnesses)
        const transaction = CardanoWasm.Transaction.new(
            tx.body(),
            witnesses,
            tx.auxiliary_data() // transaction metadata
        )
        //return Buffer.from(transaction.to_bytes(), "hex").toString("hex");
        return Buffer.from(transaction.to_bytes(), 'hex').toString('hex')
    } catch (error) {
        Logger.log(error)
        return { error: error.info || error.toString() }
    }
}

const getCollateral = (utxos) => {
    const filteredUtxos = utxos.filter((utxo) => {
        const tmpFilter = utxo.output().amount().coin()

        const compareWithMin = tmpFilter.compare(
            CardanoWasm.BigNum.from_str('5000000')
        )
        const compareWithMax = tmpFilter.compare(
            CardanoWasm.BigNum.from_str('20000000')
        )

        return (
            compareWithMin >= 0 &&
            compareWithMax <= 0 &&
            !utxo.output().amount().multiasset()
        )
    })

    return filteredUtxos[0]
}

const fetchCollateralSet = async (baseAddr) => {
    const utxos = await getUtxos(baseAddr)
    const collateralUtxo = getCollateral(utxos)

    return collateralUtxo
        ? collateralUtxo.output().amount().coin().to_str()
        : collateralUtxo
}

const fromHex = (hex) => Buffer.from(hex, 'hex')

module.exports = { call, fetchCollateralSet }
