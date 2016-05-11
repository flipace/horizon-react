import Immutable from 'immutable';
import isEqual from 'lodash.isequal';
import isPlainObject from 'is-plain-object';
import { Component, PropTypes, createElement } from 'react';
import {
  IMapStateToProps,
  IMapDispatchToProps,
  IConnectOptions,
  connect as ReactReduxConnect,
} from 'react-redux';
import { addData, changeData, removeData, addSubscription } from '../actionCreators';

const emptyArray = [];
const getDisplayName = WrappedComponent => WrappedComponent.displayName || WrappedComponent.name || 'Component';
const emptyList = Immutable.List();
const blacklist = ['__hz_data', '__hz_subscriptions'];

/**
 * Subscribes to data specified in mapData
 */
export default function subscribe(opts = {}) {
  let { mapDataToProps } = opts;

  delete opts.mapDataToProps;

  return (TargetComponent) => {
    class DataSubscriber extends Component {
      // make sure react prints parent component name on error/warnings
      static displayName = `subscribe(DataSubscriber(${getDisplayName(TargetComponent)}))`;

      static contextTypes = {
        horizon: PropTypes.func,
        store: PropTypes.object
      };

      constructor(props, context) {
        super(props, context);

        this.client = props.client || context.horizon;
        this.store = props.store || context.store;
        this.subscriptions = {};
        this.data = {};
        this.mutations = {};

        this.state = {
          subscribed: false,
          updates: 0,
          data: this.getDataNames(props),
          storeState: Object.assign({}, this.store.getState())
        };
      }

      componentDidMount() {
        this.subscribe(this.props);
      }

      componentWillReceiveProps(nextProps) {
        if (!isEqual(mapDataToProps, mapDataToProps)) {
          this.subscribe(nextProps);
        }
      }

      shouldComponentUpdate(nextProps) {
        const nextKeys = Object.keys(nextProps);
        const thisKeys = Object.keys(this.props);

        if (thisKeys.length !== nextKeys.length) return true;

        for (let i = 0; i < nextKeys.length; i++) {
          const key = nextKeys[i];

          if (blacklist.indexOf(key) <= -1) {
            if (!isEqual(nextProps[key], this.props[key])) {
              return true;
            }
          }
        }

        const subscriptionKeys = Object.keys(this.subscriptions);

        for (let i = 0; i < subscriptionKeys.length; i++) {
          const key = subscriptionKeys[i];

          if (nextProps.__hz_data.get(key) !== this.props.__hz_data.get(key)) {
            return true;
          }
        }

        return false;
      }

      componentWillUnmount() {
        // make sure to dispose all subscriptions
        this.unsubscribe();
      }

      getDataNames(props) {
        if (Array.isArray(mapDataToProps)) {
          return mapDataToProps.reduce(
            (acc, s) => { acc[s.name] = []; return acc; },
            {}
          );
        } else if (isPlainObject(mapDataToProps)) {
          return  this.getObjectWithDataKeys(
            Object.keys(mapDataToProps)
          );
        } else if (typeof mapDataToProps === 'function'){
          return this.getObjectWithDataKeys(
            Object.keys(mapDataToProps(props))
          );
        }
      }

      getObjectWithDataKeys(keys) {
        return keys.reduce( (acc, name) => {
          acc[name] = [];
          return acc;
        }, {});
      }

      /**
       * Walk through all elements in mapData and set up
       * the subscriptions which should fire setState() every
       * time data changes.
       */
      subscribe(props) {
        if (Array.isArray(mapDataToProps)) {
          this.subscribeToArray(props);
        } else if (isPlainObject(mapDataToProps)){
          this.subscribeToObject(props);
        } else if (typeof mapDataToProps === 'function'){
          this.subscribeToFunction(props);
        }

        this.setState({ subscribed: true });
      }

      /**
       * Unsubscribe from all subscriptions.
       */
      unsubscribe() {
        Object.keys(this.subscriptions).forEach( k => {
          const sub = this.subscriptions[k];

          sub.dispose
          ? sub.dispose()
          : null
        });
        this.setState({ subscribed: false });
      }

      /**
       * Query is written as an array.
       *
       * const mapDataToProps = [
       *   { name: 'todos', query: hz => hz('todos').limit(5) },
       *   { name: 'users', query: hz => hz('users').limit(5) }
       * ];
       */
      subscribeToArray(props) {
        mapDataToProps.forEach(
          ({ query, name }) => {
            this.handleQuery(query(this.client, props), name);
          }
        );
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
      subscribeToObject(props) {
        Object.keys(mapDataToProps).forEach(
          name => {
            const query = mapDataToProps[name];
            this.handleQuery(query(this.client, props), name);
          }
        )
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
      subscribeToFunction(props) {
        const subscribeTo = mapDataToProps(props);

        for (let name of Object.keys(subscribeTo)) {
          let queryResult;
          const { collection, c, query } = subscribeTo[name];

          const horizonCollection = this.client(collection || c);

          if (query && Object.keys(query).length) {
            queryResult = horizonCollection.findAll(query);
          } else {
            queryResult = horizonCollection;
          }

          this.handleQuery(queryResult, name);
        }
      }

      /**
       * Builds the query and sets up the callback when data
       * changes come in.
       * If the query is the same as the old one, we keep the old one
       * and ignore the new one.
       */
      handleQuery(query, name) {
        const sub = Immutable.fromJS({
          ...query._query
        });

        const hash = 'd-' + sub.hashCode();

        this.subscriptions[hash] = name;

        // early exit in case a subscription like this already
        // exists
        if (
          this.props.__hz_subscriptions.has(hash)
        ) return;

        const fetch = query
          .watch({ rawChanges: true })
          .forEach(this.handleData.bind(this, hash));

        this.props.dispatch(addSubscription(sub, hash));
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
      handleData = (name, change) => {
        switch (change.type) {
          case 'add':
          case 'initial':
            this.props.dispatch(addData(change.new_val, name));
            break;
          case 'change':
            this.props.dispatch(changeData(change.new_val, name));
            break;
          case 'remove':
            this.props.dispatch(removeData(change.old_val.id, name));
            break;
        }
      };

      render() {
        const subscriptionKeys = Object.keys(this.subscriptions);
        const data = this.props.__hz_data;
        const queryData = {};

        subscriptionKeys.forEach(key => {
          queryData[this.subscriptions[key]] = data.get(key, emptyList);
        });

        return createElement(TargetComponent, {
          ...this.props,
          ...this.state.data,
          ...queryData,
          horizon: this.client
        });
      }
    }

    const { mapStateToProps, mapDispatchToProps, mergeProps, options } = opts;

    const mapHorizonStateToProps = (store) =>({
      __hz_data: store.horizon.get('data'),
      __hz_subscriptions: store.horizon.get('subscriptions')
    });
    const ConnectedDataSubscriber = ReactReduxConnect(
      mapHorizonStateToProps,
      mapDispatchToProps,
      mergeProps,
      options
    )(DataSubscriber);

    /**
     * Pass options to redux "connect" so there's no need to use
     * two wrappers in application code.
     */

    return ReactReduxConnect(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps,
      options
    )(ConnectedDataSubscriber);
  }
}
