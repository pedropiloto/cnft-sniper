const ActivityLoggerInteractor = require('../interactors/activity-logger')

const log = (message, isActivity = true) => {
    // eslint-disable-next-line no-param-reassign
    if (process.env.NODE_ENV === 'development') {
        /* eslint-disable no-console */
        console.log(message)
        /* eslint-enable no-console */
    }

    if (isActivity) {
        ActivityLoggerInteractor.add(message)
    }
}

module.exports = { log }
