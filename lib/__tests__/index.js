'use strict';

var _kea = require('kea');

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

require('./helper/jsdom');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _enzyme = require('enzyme');

var _reactRedux = require('react-redux');

var _enzymeAdapterReact = require('enzyme-adapter-react-16');

var _enzymeAdapterReact2 = _interopRequireDefault(_enzymeAdapterReact);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// install the plugin

/* global test, expect */
(0, _enzyme.configure)({ adapter: new _enzymeAdapterReact2.default() });

test('can save to storage', function () {
  var storageEngine = {};
  (0, _kea.resetContext)({
    createStore: true,
    plugins: [(0, _index2.default)({ storageEngine: storageEngine })]
  });

  var store = (0, _kea.getContext)().store;

  var logicWithStorage = (0, _kea.kea)({
    path: function path() {
      return ['scenes', 'persist', 'index'];
    },
    actions: function actions() {
      return {
        setNumber: function setNumber(number) {
          return { number: number };
        }
      };
    },
    reducers: function reducers(_ref) {
      var _ref2;

      var actions = _ref.actions;
      return {
        number: [12, _propTypes2.default.number, { persist: true }, (_ref2 = {}, _ref2[actions.setNumber] = function (_, payload) {
          return payload.number;
        }, _ref2)]
      };
    }
  });

  expect((0, _kea.getPluginContext)('localStorage').storageEngine).toBeDefined();
  expect((0, _kea.getPluginContext)('localStorage').storageEngine).toBe(storageEngine);
  expect(storageEngine['scenes.persist.index.number']).not.toBeDefined();

  expect((0, _kea.getContext)().plugins.activated.map(function (p) {
    return p.name;
  })).toEqual(['core', 'localStorage']);

  var SampleComponent = function SampleComponent(_ref3) {
    var number = _ref3.number;
    return _react2.default.createElement(
      'div',
      { className: 'number' },
      number
    );
  };
  var ConnectedComponent = logicWithStorage(SampleComponent);

  var wrapper = (0, _enzyme.mount)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(ConnectedComponent, null)
  ));

  expect(logicWithStorage.cache.localStorageDefaults.number).toBe(12);

  expect(wrapper.find('.number').text()).toEqual('12');

  logicWithStorage.actions.setNumber(42);

  expect(wrapper.find('.number').text()).toEqual('42');

  wrapper.unmount();

  // do it all again

  (0, _kea.resetContext)({
    createStore: true,
    plugins: [(0, _index2.default)({ storageEngine: storageEngine })]
  });
  store = (0, _kea.getContext)().store;

  logicWithStorage = (0, _kea.kea)({
    path: function path() {
      return ['scenes', 'persist', 'index'];
    },
    actions: function actions() {
      return {
        setNumber: function setNumber(number) {
          return { number: number };
        }
      };
    },
    reducers: function reducers(_ref4) {
      var _ref5;

      var actions = _ref4.actions;
      return {
        number: [12, _propTypes2.default.number, { persist: true }, (_ref5 = {}, _ref5[actions.setNumber] = function (_, payload) {
          return payload.number;
        }, _ref5)]
      };
    }
  });

  expect((0, _kea.getPluginContext)('localStorage').storageEngine).toBeDefined();
  expect((0, _kea.getPluginContext)('localStorage').storageEngine).toBe(storageEngine);
  expect(storageEngine['scenes.persist.index.number']).toBeDefined();

  expect((0, _kea.getContext)().plugins.activated.map(function (p) {
    return p.name;
  })).toEqual(['core', 'localStorage']);

  SampleComponent = function SampleComponent(_ref6) {
    var number = _ref6.number;
    return _react2.default.createElement(
      'div',
      { className: 'number' },
      number
    );
  };
  ConnectedComponent = logicWithStorage(SampleComponent);

  wrapper = (0, _enzyme.mount)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(ConnectedComponent, null)
  ));
  expect(logicWithStorage.cache.localStorageDefaults.number).toBe(12);

  expect(wrapper.find('.number').text()).toEqual('42'); // even if value says 12 in the logic store

  wrapper.unmount();
});

test('prefix and separator work', function () {
  var storageEngine = {
    setItem: function setItem(key, value) {
      this[key] = value;
    },
    removeItem: function removeItem(key) {
      delete this[key];
    }
  };
  (0, _kea.resetContext)({
    createStore: true,
    plugins: [(0, _index2.default)({ storageEngine: storageEngine, prefix: 'something', separator: '_' })]
  });

  var logicWithStorage = (0, _kea.kea)({
    path: function path() {
      return ['scenes', 'persist', 'index'];
    },
    actions: function actions() {
      return {
        setNumber: function setNumber(number) {
          return { number: number };
        }
      };
    },
    reducers: function reducers(_ref7) {
      var _ref8, _ref9;

      var actions = _ref7.actions;
      return {
        number: [12, _propTypes2.default.number, { persist: true }, (_ref8 = {}, _ref8[actions.setNumber] = function (_, payload) {
          return payload.number;
        }, _ref8)],
        override: [22, _propTypes2.default.number, { persist: true, prefix: 'nope', separator: '|' }, (_ref9 = {}, _ref9[actions.setNumber] = function (_, payload) {
          return payload.number;
        }, _ref9)]
      };
    }
  });

  expect((0, _kea.getPluginContext)('localStorage').storageEngine).toBeDefined();
  expect((0, _kea.getPluginContext)('localStorage').storageEngine).toBe(storageEngine);

  logicWithStorage.mount();
  logicWithStorage.actions.setNumber(55);

  var _logicWithStorage$val = logicWithStorage.values,
      number = _logicWithStorage$val.number,
      override = _logicWithStorage$val.override;


  expect(number).toBe(55);
  expect(override).toBe(55);

  expect(storageEngine['something_scenes_persist_index_number']).toBe('55');
  expect(storageEngine['nope|scenes|persist|index|override']).toBe('55');
});

test('works with extended logic', function () {
  var storageEngine = {};

  (0, _kea.resetContext)({
    createStore: true,
    plugins: [(0, _index2.default)({ storageEngine: storageEngine })]
  });

  var logic = (0, _kea.kea)({
    path: function path() {
      return ['scenes', 'persist', 'index'];
    },
    actions: function actions() {
      return {
        setNumber: function setNumber(number) {
          return { number: number };
        }
      };
    },
    reducers: function reducers(_ref10) {
      var _ref11;

      var actions = _ref10.actions;
      return {
        number: [12, _propTypes2.default.number, { persist: true }, (_ref11 = {}, _ref11[actions.setNumber] = function (_, payload) {
          return payload.number;
        }, _ref11)]
      };
    }
  });

  logic.extend({
    reducers: function reducers(_ref12) {
      var _ref13;

      var actions = _ref12.actions;
      return {
        otherNumber: [12, _propTypes2.default.number, { persist: true }, (_ref13 = {}, _ref13[actions.setNumber] = function (_, payload) {
          return payload.number;
        }, _ref13)]
      };
    }
  });

  logic.mount();
  logic.actions.setNumber(55);

  var _logic$values = logic.values,
      number = _logic$values.number,
      otherNumber = _logic$values.otherNumber;


  expect(number).toBe(55);
  expect(otherNumber).toBe(55);

  expect(storageEngine['scenes.persist.index.number']).toBe('55');
  expect(storageEngine['scenes.persist.index.otherNumber']).toBe('55');
});