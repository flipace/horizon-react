'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reducerMap;

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var initialState = (0, _seamlessImmutable2["default"])({
  data: {},
  subscriptions: {}
});

var reducerMap = (_reducerMap = {}, _defineProperty(_reducerMap, _actionTypes2["default"].HZ_ADD_DATA, function (state, _ref) {
  var _ref$payload = _ref.payload;
  var key = _ref$payload.key;
  var data = _ref$payload.data;

  if (typeof state.data[key] === 'undefined') {
    return state.setIn(['data', key], (0, _seamlessImmutable2["default"])([data]));
  }

  var newList = (0, _seamlessImmutable2["default"])([].concat(_toConsumableArray(state.data[key]), [data]));

  return state.setIn(['data', key], newList);
}), _defineProperty(_reducerMap, _actionTypes2["default"].HZ_CHANGE_DATA, function (state, _ref2) {
  var _ref2$payload = _ref2.payload;
  var key = _ref2$payload.key;
  var data = _ref2$payload.data;

  var index = state.data[key].findIndex(function (d) {
    return d.id === data.id;
  });

  return state.setIn(['data', key], state.data[key].set(index, (0, _seamlessImmutable2["default"])(data)));
}), _defineProperty(_reducerMap, _actionTypes2["default"].HZ_REMOVE_DATA, function (state, _ref3) {
  var _ref3$payload = _ref3.payload;
  var key = _ref3$payload.key;
  var id = _ref3$payload.id;
  return state.setIn(['data', key], state.data[key].filter(function (d) {
    return d.id !== id;
  }));
}), _defineProperty(_reducerMap, _actionTypes2["default"].HZ_ADD_SUBSCRIPTION, function (state, _ref4) {
  var _ref4$payload = _ref4.payload;
  var key = _ref4$payload.key;
  var sub = _ref4$payload.sub;

  if (state.subscriptions[key] !== sub) {
    return state.setIn(['subscriptions', key], (0, _seamlessImmutable2["default"])(sub));
  }

  return state;
}), _defineProperty(_reducerMap, _actionTypes2["default"].HZ_REMOVE_SUBSCRIPTION, function (state, _ref5) {
  var hash = _ref5.payload.hash;

  if (state.subscriptions[hash]) {
    var newState = state.set('subscriptions', state.subscriptions.without(hash));

    if (newState.data && newState.data[hash]) {
      return newState.set('data', newState.data.without(hash));
    }

    return newState;
  }

  return state;
}), _reducerMap);

function createReducer(initialState, reducerMap) {
  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];

    var reducer = reducerMap[action.type];
    return reducer ? reducer(state, { type: action.type, payload: (0, _lodash2["default"])(action, 'type') }) : state;
  };
}

exports["default"] = createReducer(initialState, reducerMap);