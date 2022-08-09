const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs')
const { mnemonicToEntropy } = require('bip39')

const call = (seedKey) => {
    const entropy = mnemonicToEntropy(seedKey.join(' '))
    const rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
        Buffer.from(entropy, 'hex'),
        Buffer.from('')
    )

    const accountKey = rootKey
        .derive(harden(1852)) // purpose
        .derive(harden(1815)) // coin type
        .derive(harden(0)) // account #0

    const utxoPubKey = accountKey
        .derive(0) // external
        .derive(0)
        .to_public()

    const stakeKey = accountKey
        .derive(2) // chimeric
        .derive(0)
        .to_public()

    const prvKey = accountKey
        .derive(0) // external
        .derive(0)
        .to_raw_key()

    const baseAddr = CardanoWasm.BaseAddress.new(
        CardanoWasm.NetworkInfo.mainnet().network_id(),
        CardanoWasm.StakeCredential.from_keyhash(
            utxoPubKey.to_raw_key().hash()
        ),
        CardanoWasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash())
    )

    return { prvKey, baseAddr: baseAddr.to_address().to_bech32() }
}

const harden = (num) => {
    return 0x80000000 + num
}

module.exports = { call }
