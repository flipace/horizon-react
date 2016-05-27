'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeSubscription = exports.addSubscription = exports.removeData = exports.changeData = exports.addData = undefined;

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addData = exports.addData = function addData(data, key) {
  return { type: _actionTypes2.default.HZ_ADD_DATA, data: data, key: key };
};
var changeData = exports.changeData = function changeData(data, key) {
  return { type: _actionTypes2.default.HZ_CHANGE_DATA, data: data, key: key };
};
var removeData = exports.removeData = function removeData(id, key) {
  return { type: _actionTypes2.default.HZ_REMOVE_DATA, id: id, key: key };
};
var addSubscription = exports.addSubscription = function addSubscription(sub, key) {
  return { type: _actionTypes2.default.HZ_ADD_SUBSCRIPTION, sub: sub, key: key };
};
var removeSubscription = exports.removeSubscription = function removeSubscription(hash) {
  return { type: _actionTypes2.default.HZ_REMOVE_SUBSCRIPTION, hash: hash };
};