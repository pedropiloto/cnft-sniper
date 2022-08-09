require('dotenv').config()
const axios = require('axios')

const getCollectionFloor = (policyId) => {
    let config = {
        method: 'get',
        url: `https://server.jpgstoreapis.com/collection/${policyId}/floor`,
        headers: {
            authority: 'server.jpgstoreapis.com',
            origin: 'https://www.jpg.store',
            referer: 'https://www.jpg.store/',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        },
    }

    return axios(config)
}

const getCollectionItems = (policyId, traits) => {
    var config = {
        method: 'get',
        url: encodeURI(
            `https://server.jpgstoreapis.com/search/tokens?policyIds=["${policyId}"]&saleType=default&sortBy=price-low-to-high&traits=${traits}&nameQuery=&verified=default&pagination={}&size=20`
        ),
        headers: {
            authority: 'server.jpgstoreapis.com',
            origin: 'https://www.jpg.store',
            referer: 'https://www.jpg.store/',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        },
    }

    return axios(config)
}

const getCollectionListings = (policyId) => {
    var config = {
        method: 'get',
        url: encodeURI(
            `https://server.jpgstoreapis.com/policy/${policyId}/sales?page=1`
        ),
        headers: {
            authority: 'server.jpgstoreapis.com',
            origin: 'https://www.jpg.store',
            referer: 'https://www.jpg.store/',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        },
    }

    return axios(config)
}

const getAsset = (assetId) => {
    var config = {
        method: 'get',
        url: `https://server.jpgstoreapis.com/token/${assetId}`,
        headers: {
            authority: 'server.jpgstoreapis.com',
            origin: 'https://www.jpg.store',
            referer: 'https://www.jpg.store/',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        },
    }

    return axios(config)
}

const buildBuyTransaction = (utxos, collateral, baseAddr, listingId) => {
    const data = {
        collateral: collateral,
        utxos: utxos,
        address: baseAddr,
        action: 'BUY',
        listingId: Number(listingId),
    }

    return axios.post(`https://server.jpgstoreapis.com/transaction/build`, data)
}

const registerTransaction = (txHash, listingId) => {
    var data = JSON.stringify({
        txHash: txHash,
        listingId: Number(listingId),
    })

    var config = {
        method: 'post',
        url: 'https://server.jpgstoreapis.com/transaction/register',
        headers: {
            authority: 'server.jpgstoreapis.com',
            accept: 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9,pt-PT;q=0.8,pt;q=0.7',
            'content-type': 'application/json',
            origin: 'https://www.jpg.store',
        },
        data: data,
    }

    return axios(config)
}

module.exports = {
    getCollectionFloor,
    getCollectionItems,
    getCollectionListings,
    buildBuyTransaction,
    getAsset,
    registerTransaction,
}
