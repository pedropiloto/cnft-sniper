class Listing {
    constructor(url, price, collectionName, provider) {
        this.url = url
        this.price = price
        this.collectionName = collectionName
        this.provider = provider
    }

    equals(other) {
        return this.url === other.url && this.price === other.price
    }
}

module.exports = Listing
