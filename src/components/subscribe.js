import isEqual from 'lodash.isequal';
import isPlainObject from 'is-plain-object';
import { Component, PropTypes, createElement } from 'react';
import {
  connect as ReactReduxConnect
} from 'react-redux';

const emptyArray = [];
const getDisplayName = WrappedComponent => WrappedComponent.displayName ||
  WrappedComponent.name ||
  'Component';

/**
 * Subscribes to data specified in mapData
 */
export default function subscribe(opts = {}) {
  const { mapDataToProps } = opts;

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

      componentWillMount() {
        this.subscribe(this.props);
      }

      componentWillReceiveProps(nextProps) {
        if (!isEqual(nextProps, this.props)) {
          this.subscribe(nextProps);
        }
      }

      componentWillUnmount() {
        // make sure to dispose all subscriptions
        this.unsubscribe(false);
      }

      render() {
        return createElement(TargetComponent, {
          ...this.props,
          ...this.state.data,
          horizon: this.client
        });
      }

      getDataNames(props) {
        if (Array.isArray(mapDataToProps)) {
          return mapDataToProps.reduce(
            (acc, s) => { acc[s.name] = []; return acc; },
            {}
          );
        } else if (isPlainObject(mapDataToProps)) {
          return this.getObjectWithDataKeys(
            Object.keys(mapDataToProps)
          );
        } else if (typeof mapDataToProps === 'function') {
          return this.getObjectWithDataKeys(
            Object.keys(mapDataToProps(props))
          );
        }
        return null;
      }

      getObjectWithDataKeys(keys) {
        return keys.reduce((acc, name) => {
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
        } else if (isPlainObject(mapDataToProps)) {
          this.subscribeToObject(props);
        } else if (typeof mapDataToProps === 'function') {
          this.subscribeToFunction(props);
        }

        this.setState({ subscribed: true });
      }

      /**
       * Unsubscribe from all subscriptions.
       */
      unsubscribe(updateState = true) {
        Object.keys(this.subscriptions).forEach(k => {
          if (this.subscriptions[k].dispose) {
            this.subscriptions[k].dispose();
          }
        });

        if (updateState) {
          this.setState({ subscribed: false });
        }
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
        );
      }

      /**
       * Query is written as a function which accepts "props".
       * We execute the function to get back an object with
       * collection and optional query key.
       *
       * Example:
       *
       * const mapDataToProps = (props) => ({
       *   todos: {
       *     collection: 'todos',
       *     query: { name: props.name }
       *   }
       * });
       *
       * @param {String} collection is the name of the collection you want to access
       * @param {Object|String} query is the query object which will be passed to "findAll"
       */
      subscribeToFunction(props) {
        const subscribeTo = mapDataToProps(props);

        for (const name of Object.keys(subscribeTo)) {
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
        if (this.subscriptions[name]) {
          const prevQuery = this.subscriptions[name].query;

          // if the new query is the same as the previous one,
          // we keep the previous one
          if (isEqual(prevQuery, query._query)) return; // eslint-disable-line no-underscore-dangle
        }

        this.subscriptions[name] = {
          subscription: query
            .watch()
            .forEach(this.handleData.bind(this, name)),
          query: query._query // eslint-disable-line no-underscore-dangle
        };
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
      handleData = (name, docs) => {
        let data = docs || emptyArray;

        // always return an array, even if there's just one document
        if (isPlainObject(docs)) {
          data = [docs];
        }

        this.setState({
          data: {
            ...this.state.data,
            [name]: data
          }
        });
      };
    }

    /**
     * Pass options to redux "connect" so there's no need to use
     * two wrappers in application code.
     */
    const { mapStateToProps, mapDispatchToProps, mergeProps, options } = opts;
    return ReactReduxConnect(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps,
      options
    )(DataSubscriber);
  };
}
