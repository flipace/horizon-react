'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = subscribe;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _react = require('react');

var _reactRedux = require('react-redux');

var _actionCreators = require('../actionCreators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var emptyArray = [];
var getDisplayName = function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};
var emptyList = _immutable2.default.List();
var blacklist = ['__hz_data', '__hz_subscriptions'];

/**
 * Subscribes to data specified in mapData
 */
function subscribe() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var mapDataToProps = opts.mapDataToProps;


  delete opts.mapDataToProps;

  return function (TargetComponent) {
    var DataSubscriber = function (_Component) {
      _inherits(DataSubscriber, _Component);

      // make sure react prints parent component name on error/warnings

      function DataSubscriber(props, context) {
        _classCallCheck(this, DataSubscriber);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DataSubscriber).call(this, props, context));

        _this.handleData = function (name, change) {
          switch (change.type) {
            case 'add':
            case 'initial':
              _this.props.dispatch((0, _actionCreators.addData)(change.new_val, name));
              break;
            case 'change':
              _this.props.dispatch((0, _actionCreators.changeData)(change.new_val, name));
              break;
            case 'remove':
              _this.props.dispatch((0, _actionCreators.removeData)(change.old_val.id, name));
              break;
          }
        };

        _this.client = props.client || context.horizon;
        _this.store = props.store || context.store;
        _this.subscriptions = {};
        _this.data = {};
        _this.mutations = {};

        _this.state = {
          subscribed: false,
          updates: 0,
          data: _this.getDataNames(props),
          storeState: Object.assign({}, _this.store.getState())
        };
        return _this;
      }

      _createClass(DataSubscriber, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.subscribe(this.props);
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          if (!(0, _lodash2.default)(mapDataToProps, mapDataToProps)) {
            this.subscribe(nextProps);
          }
        }
      }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
          var nextKeys = Object.keys(nextProps);
          var thisKeys = Object.keys(this.props);

          if (thisKeys.length !== nextKeys.length) return true;

          for (var i = 0; i < nextKeys.length; i++) {
            var key = nextKeys[i];

            if (blacklist.indexOf(key) <= -1) {
              if (!(0, _lodash2.default)(nextProps[key], this.props[key])) {
                return true;
              }
            }
          }

          var subscriptionKeys = Object.keys(this.subscriptions);

          for (var _i = 0; _i < subscriptionKeys.length; _i++) {
            var _key = subscriptionKeys[_i];

            if (nextProps.__hz_data.get(_key) !== this.props.__hz_data.get(_key)) {
              return true;
            }
          }

          return false;
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          // make sure to dispose all subscriptions
          this.unsubscribe();
        }
      }, {
        key: 'getDataNames',
        value: function getDataNames(props) {
          if (Array.isArray(mapDataToProps)) {
            return mapDataToProps.reduce(function (acc, s) {
              acc[s.name] = [];return acc;
            }, {});
          } else if ((0, _isPlainObject2.default)(mapDataToProps)) {
            return this.getObjectWithDataKeys(Object.keys(mapDataToProps));
          } else if (typeof mapDataToProps === 'function') {
            return this.getObjectWithDataKeys(Object.keys(mapDataToProps(props)));
          }
        }
      }, {
        key: 'getObjectWithDataKeys',
        value: function getObjectWithDataKeys(keys) {
          return keys.reduce(function (acc, name) {
            acc[name] = [];
            return acc;
          }, {});
        }

        /**
         * Walk through all elements in mapData and set up
         * the subscriptions which should fire setState() every
         * time data changes.
         */

      }, {
        key: 'subscribe',
        value: function subscribe(props) {
          if (Array.isArray(mapDataToProps)) {
            this.subscribeToArray(props);
          } else if ((0, _isPlainObject2.default)(mapDataToProps)) {
            this.subscribeToObject(props);
          } else if (typeof mapDataToProps === 'function') {
            this.subscribeToFunction(props);
          }

          this.setState({ subscribed: true });
        }

        /**
         * Unsubscribe from all subscriptions.
         */

      }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
          var _this2 = this;

          Object.keys(this.subscriptions).forEach(function (k) {
            var sub = _this2.subscriptions[k];

            sub.dispose ? sub.dispose() : null;
          });
          this.setState({ subscribed: false });
        }

        /**
         * Query is written as an array.
         *
         * const mapDataToProps = [
         *   { name: 'todos', query: hz => hz('todos').limit(5) },
         *   { name: 'users', query: hz => hz('users').limit(5) }
         * ];
         */

      }, {
        key: 'subscribeToArray',
        value: function subscribeToArray(props) {
          var _this3 = this;

          mapDataToProps.forEach(function (_ref) {
            var query = _ref.query;
            var name = _ref.name;

            _this3.handleQuery(query(_this3.client, props), name);
          });
        }

        /**
         * Query is written as an object.
         *
         * Example:
         *
         * const mapDataToProps = {
         *   todos: hz => hz('todos').findAll(...),
         *   users: (hz, props) => hz('users').limit(5)
         * };
         */

      }, {
        key: 'subscribeToObject',
        value: function subscribeToObject(props) {
          var _this4 = this;

          Object.keys(mapDataToProps).forEach(function (name) {
            var query = mapDataToProps[name];
            _this4.handleQuery(query(_this4.client, props), name);
          });
        }

        /**
         * Query is written as a function which accepts "props".
         * We execute the function to get back an object with
         * collection and optional query key.
         *
         * Example:
         *
         * const mapDataToProps = (props) => ({
         *   name: 'todos',
         *   query: { name: props.name }
         * });
         *
         * @param {String} collection is the name of the collection you want to access
         * @param {Object|String} query is the query object which will be passed to "findAll"
         */

      }, {
        key: 'subscribeToFunction',
        value: function subscribeToFunction(props) {
          var subscribeTo = mapDataToProps(props);

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = Object.keys(subscribeTo)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var name = _step.value;

              var queryResult = void 0;
              var _subscribeTo$name = subscribeTo[name];
              var collection = _subscribeTo$name.collection;
              var c = _subscribeTo$name.c;
              var query = _subscribeTo$name.query;


              var horizonCollection = this.client(collection || c);

              if (query && Object.keys(query).length) {
                queryResult = horizonCollection.findAll(query);
              } else {
                queryResult = horizonCollection;
              }

              this.handleQuery(queryResult, name);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }

        /**
         * Builds the query and sets up the callback when data
         * changes come in.
         * If the query is the same as the old one, we keep the old one
         * and ignore the new one.
         */

      }, {
        key: 'handleQuery',
        value: function handleQuery(query, name) {
          var sub = _immutable2.default.fromJS(_extends({}, query._query));

          var hash = 'd-' + sub.hashCode();

          this.subscriptions[hash] = name;

          // early exit in case a subscription like this already
          // exists
          if (this.props.__hz_subscriptions.has(hash)) return;

          var fetch = query.watch({ rawChanges: true }).forEach(this.handleData.bind(this, hash));

          this.props.dispatch((0, _actionCreators.addSubscription)(sub, hash));
        }

        /**
         * When new data comes in, we update the state of this component,
         * this will cause a rerender of it's child component with the new
         * data in props.
         *
         * @TODO this is probably the place where the data should be propagated
         * to the redux store. If other components subscribe with the same query,
         * they should find that there's already a query listening and just grab the
         * according data from the app state instead of setting up a separate listener.
         */

      }, {
        key: 'render',
        value: function render() {
          var _this5 = this;

          var subscriptionKeys = Object.keys(this.subscriptions);
          var data = this.props.__hz_data;
          var queryData = {};

          subscriptionKeys.forEach(function (key) {
            queryData[_this5.subscriptions[key]] = data.get(key, emptyList);
          });

          return (0, _react.createElement)(TargetComponent, _extends({}, this.props, this.state.data, queryData, {
            horizon: this.client
          }));
        }
      }]);

      return DataSubscriber;
    }(_react.Component);

    DataSubscriber.displayName = 'subscribe(DataSubscriber(' + getDisplayName(TargetComponent) + '))';
    DataSubscriber.contextTypes = {
      horizon: _react.PropTypes.func,
      store: _react.PropTypes.object
    };
    var mapStateToProps = opts.mapStateToProps;
    var mapDispatchToProps = opts.mapDispatchToProps;
    var mergeProps = opts.mergeProps;
    var options = opts.options;


    var mapHorizonStateToProps = function mapHorizonStateToProps(store, props) {
      var horizonProps = {
        __hz_data: store.horizon.get('data'),
        __hz_subscriptions: store.horizon.get('subscriptions')
      };

      if (mapStateToProps && typeof mapStateToProps === 'function') {
        return _extends({}, mapStateToProps(store, props), horizonProps);
      }

      return horizonProps;
    };

    /**
     * Pass options to redux "connect" so there's no need to use
     * two wrappers in application code.
     */

    return (0, _reactRedux.connect)(mapHorizonStateToProps, mapDispatchToProps, mergeProps, options)(DataSubscriber);
  };
}