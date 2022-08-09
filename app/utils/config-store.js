const Store = require('electron-store')

const store = new Store()

const setConfig = (config) => {
    store.set('config', config)
}

const getConfig = () => {
    return store.get('config')
}

const clearConfig = () => {
    store.set('config', {})
}

module.exports = { getConfig, setConfig, clearConfig }
