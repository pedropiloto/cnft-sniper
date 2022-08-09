const lovelaceToADA = (lovelace) => {
    return lovelace / 1000000
}

const adaTolovelace = (ada) => {
    return ada * 1000000
}

module.exports = { lovelaceToADA, adaTolovelace }
