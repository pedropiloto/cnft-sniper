require('dotenv').config()
const axios = require('axios')
const Listing = require('../models/listing')

const getListings = async (collection) => {
    const body = {
        search: '',
        types: ['listing', 'offer', 'bundle'],
        project: collection['cnft_name'],
        sort: { price: 1 },
        priceMin: null,
        priceMax: null,
        page: 1,
        verified: true,
        nsfw: false,
        sold: false,
        smartContract: true,
    }
    const response = await axios.post(
        'https://api.cnft.io/market/listings',
        body,
        {
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
                origin: 'https://cnft.io',
                referer: 'https://cnft.io/',
            },
        }
    )
    const collectionList = response.data.results

    if (collectionList.length === 0) {
        return []
    }

    return collectionList.map(
        (c) =>
            new Listing(
                `https://cnft.io/token/${c._id}`,
                c.price / 1000000,
                collection['collection_name'],
                'CNFT'
            )
    )
}

module.exports = {
    getListings,
}
