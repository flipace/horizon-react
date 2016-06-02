'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _reactDom = require('react-dom');

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _client = require('@horizon/client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Initializes connection to Horizon server and passes
 * hzConnected prop to enhanced component.
 */

var _class = function (_Component) {
  _inherits(_class, _Component);

  _createClass(_class, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        horizon: this.horizon,
        store: this.store
      };
    }
  }]);

  function _class(props, context) {
    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, props, context));

    _this.onStatus = function (status) {
      try {
        // timeout is needed since the onConnected callback is not enough
        // to determine ready state
        setTimeout(function () {
          _this.setState({
            hzStatus: status
          });
        }, 250);
      } catch (e) {
        console.error("Error bubbled up to horizon-react", e);
      }
    };

    var initialState = {};

    // the horizon connection
    _this.horizon = props.horizon ? props.horizon : (0, _client2["default"])(props.horizonProps);

    // the redux connection
    _this.store = props.store;

    initialState.hzStatus = props.horizon ? props.horizon.status().getValue() : false;

    _this.state = initialState;

    // set up connection status callbacks
    _this.horizon.onDisconnected(_this.onStatus);
    _this.horizon.onReady(_this.onStatus);
    _this.horizon.onSocketError(_this.onStatus);

    if (props.horizon) return _possibleConstructorReturn(_this);

    _this.horizon.connect(_this.onStatus);
    return _this;
  }

  _createClass(_class, [{
    key: 'render',
    value: function render() {
      return this.state.hzStatus.type !== 'ready' && this.props.loadingComponent ? this.renderConnected() : this.renderConnected();
    }
  }, {
    key: 'renderConnected',
    value: function renderConnected() {
      return _react.Children.only(this.props.children);
    }
  }, {
    key: 'renderLoading',
    value: function renderLoading() {
      return this.props.loadingComponent ? (0, _react.createElement)(this.props.loadingComponent) : (0, _react.createElement)('span');
    }
  }]);

  return _class;
}(_react.Component);

_class.propTypes = {
  store: _react.PropTypes.shape({
    subscribe: _react.PropTypes.func.isRequired,
    dispatch: _react.PropTypes.func.isRequired,
    getState: _react.PropTypes.func.isRequired
  }),
  horizonProps: _react.PropTypes.object,
  horizon: _react.PropTypes.func,
  children: _react.PropTypes.element.isRequired
};
_class.defaultProps = {
  horizonProps: {},
  loadingComponent: false
};
_class.childContextTypes = {
  horizon: _react.PropTypes.func,
  store: _react.PropTypes.object
};
exports["default"] = _class;