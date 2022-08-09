const Mutex = require('async-mutex').Mutex
const withTimeout = require('async-mutex').withTimeout

let activity = []
const logLock = withTimeout(new Mutex(), 20000)

const add = async (log) => {
    const release = await logLock.acquire()
    try {
        activity.push(log)
    } finally {
        release()
    }
}

const getAll = async () => {
    const release = await logLock.acquire()
    try {
        if (activity.length > 1999) {
            activity = activity.slice(1, activity.length)
        }
        return activity
    } finally {
        release()
    }
}

module.exports = { add, getAll }
