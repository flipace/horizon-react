'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reducerMap;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var initialState = _immutable2["default"].fromJS({
  data: {},
  subscriptions: {}
});

var reducerMap = (_reducerMap = {}, _defineProperty(_reducerMap, _actionTypes2["default"].HZ_ADD_DATA, function (state, _ref) {
  var _ref$payload = _ref.payload;
  var key = _ref$payload.key;
  var data = _ref$payload.data;

  var path = ['data', key];

  if (!state.hasIn(path)) {
    return state.setIn(path, _immutable2["default"].fromJS([data]));
  }

  var newList = _immutable2["default"].fromJS([].concat(_toConsumableArray(state.getIn(path).toJS()), [_immutable2["default"].fromJS(data)]));

  return state.setIn(path, newList);
}), _defineProperty(_reducerMap, _actionTypes2["default"].HZ_CHANGE_DATA, function (state, _ref2) {
  var _ref2$payload = _ref2.payload;
  var key = _ref2$payload.key;
  var data = _ref2$payload.data;

  var path = ['data', key];
  var index = state.getIn(['data', key]).findIndex(function (d) {
    return d.get('id') === data.id;
  });

  return state.setIn(path, state.getIn(path).set(index, _immutable2["default"].fromJS(data)));
}), _defineProperty(_reducerMap, _actionTypes2["default"].HZ_REMOVE_DATA, function (state, _ref3) {
  var _ref3$payload = _ref3.payload;
  var key = _ref3$payload.key;
  var id = _ref3$payload.id;

  return state.setIn(['data', key], state.getIn(['data', key]).filter(function (d) {
    return d.get('id') !== id;
  }));
}), _defineProperty(_reducerMap, _actionTypes2["default"].HZ_ADD_SUBSCRIPTION, function (state, _ref4) {
  var _ref4$payload = _ref4.payload;
  var key = _ref4$payload.key;
  var sub = _ref4$payload.sub;

  if (state.getIn(['subscriptions', key]) !== sub) {
    return state.setIn(['subscriptions', key], _immutable2["default"].fromJS(sub));
  }

  return state;
}), _reducerMap);

function createReducer(initialState, reducerMap) {
  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];

    var reducer = reducerMap[action.type];
    return reducer ? reducer(state, { type: action.type, payload: _.omit(action, 'type') }) : state;
  };
}

exports["default"] = createReducer(initialState, reducerMap);