// Specify a string key:
// Don't do this though, your keys should most likely be stored in env variables
// and accessed via process.env.MY_SECRET_KEY
const key = process.env.APP_KEY || 'nzyH8FSHJjdUhMEwDS46nNwTFFyTfDVZ'

// Create an encryptor:
const encryptor = require('simple-encryptor')(key)
const isDevelopment = process.env.NODE_ENV === 'development'

let storageCache = {}

let hasLocalStorage = false
let storage = {}

try {
  storage = window.localStorage

  const x = '__storage_test__'
  storage.setItem(x, x)
  storage.removeItem(x)

  hasLocalStorage = true
} catch (e) {
  // not available
}

export default {
  name: 'localStorage',

  // can be used globally and locally
  global: true,
  local: true,

  // reducerObjects is an object with the following structure:
  // { key: { reducer, value, type, options } }
  mutateReducerObjects (input, output, reducerObjects) {
    if (hasLocalStorage && input.path) {
      Object.keys(reducerObjects).filter(key => reducerObjects[key].options && reducerObjects[key].options.persist).forEach(key => {
        const path = `${output.path.join('.')}.${key}`
        const defaultValue = reducerObjects[key].value
        const defaultReducer = reducerObjects[key].reducer

        let value = ''
        if (isDevelopment) {
          value = storage[path] ? JSON.parse(storage[path]) : defaultValue
        } else {
          value = storage[path] ? JSON.parse(encryptor.decrypt(storage[path])) : defaultValue
        }
        storageCache[path] = value

        const reducer = (state = value, payload) => {
          const result = defaultReducer(state, payload)
          if (storageCache[path] !== result) {
            storageCache[path] = result

            if (isDevelopment) {
              storage[path] = encryptor.encrypt(JSON.stringify(result))
            } else {
              storage[path] = JSON.stringify(result)
            }
          }
          return result
        }

        reducerObjects[key].reducer = reducer
        reducerObjects[key].value = value
      })
    }
  },

  clearCache () {
    storageCache = {}
  }
}
