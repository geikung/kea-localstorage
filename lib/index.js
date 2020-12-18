'use strict';

exports.__esModule = true;

var _kea = require('kea');

var key = process.env.APP_KEY || 'nzyH8FSHJjdUhMEwDS46nNwTFFyTfDVZ';

// Create an encryptor:
var encryptor = require('simple-encryptor')(key);
var isDevelopment = false; // process.env.NODE_ENV === 'development'

var localStorageEngine = void 0;

try {
  localStorageEngine = window.localStorage;

  var x = '__storage_test__';
  localStorageEngine.setItem(x, x);
  localStorageEngine.removeItem(x);
} catch (e) {
  localStorageEngine = undefined;
}

var localStoragePlugin = function localStoragePlugin() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$prefix = _ref.prefix,
      prefix = _ref$prefix === undefined ? '' : _ref$prefix,
      _ref$separator = _ref.separator,
      separator = _ref$separator === undefined ? '.' : _ref$separator,
      _ref$storageEngine = _ref.storageEngine,
      storageEngine = _ref$storageEngine === undefined ? localStorageEngine : _ref$storageEngine;

  return {
    name: 'localStorage',

    events: {
      afterPlugin: function afterPlugin() {
        (0, _kea.setPluginContext)('localStorage', { storageCache: {}, storageEngine: storageEngine });
      },
      beforeCloseContext: function beforeCloseContext(context) {
        (0, _kea.setPluginContext)('localStorage', { storageCache: {}, storageEngine: storageEngine });
      }
    },

    buildOrder: {
      localStorage: { after: 'reducers' }
    },

    buildSteps: {
      localStorage: function localStorage(logic, input) {
        if (!storageEngine) {
          return;
        }

        var keysToPersist = Object.keys(logic.reducerOptions).filter(function (key) {
          return logic.reducerOptions[key].persist && !(logic.cache.localStorage && logic.cache.localStorage[key]);
        });

        if (Object.keys(keysToPersist).length === 0) {
          return;
        }

        if (!logic.cache.localStorage) {
          logic.cache.localStorage = {};
        }

        if (!logic.cache.localStorageDefaults) {
          logic.cache.localStorageDefaults = {};
        }

        if (!input.path && logic.pathString.indexOf('kea.inline.') === 0) {
          console.error('Logic store must have a path specified in order to persist reducer values');
          return;
        }

        var _getPluginContext = (0, _kea.getPluginContext)('localStorage'),
            storageCache = _getPluginContext.storageCache;

        keysToPersist.forEach(function (key) {
          var _prefix = logic.reducerOptions[key].prefix || prefix;
          var _separator = logic.reducerOptions[key].separator || separator;

          var path = '' + (_prefix ? _prefix + _separator : '') + logic.path.join(_separator) + _separator + key;
          var defaultReducer = logic.reducers[key];

          logic.cache.localStorageDefaults[key] = logic.defaults[key];

          if (typeof storageEngine[path] !== 'undefined') {
            try {
              if (isDevelopment) {
                logic.defaults[key] = JSON.parse(storageEngine[path]);
              } else {
                logic.defaults[key] = JSON.parse(encryptor.decrypt(storageEngine[path]));
              }
            } catch (error) {
              logic.defaults[key] = JSON.parse(storageEngine[path]);
            }
          }

          storageCache[path] = logic.defaults[key];

          logic.reducers[key] = function () {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : logic.defaults[key];
            var payload = arguments[1];

            var result = defaultReducer(state, payload);
            if (storageCache[path] !== result) {
              storageCache[path] = result;

              if (isDevelopment) {
                storageEngine[path] = JSON.stringify(result);
              } else {
                storageEngine[path] = encryptor.encrypt(JSON.stringify(result));
              }
            }
            return result;
          };
          logic.cache.localStorage[key] = true;
        });
      }
    }
  };
};

exports.default = localStoragePlugin;