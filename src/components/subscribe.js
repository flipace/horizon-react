import { Component, PropTypes, createElement } from 'react';
import {
  IMapStateToProps,
  IMapDispatchToProps,
  IConnectOptions,
  connect as ReactReduxConnect,
} from 'react-redux';
import isPlainObject from 'is-plain-object';

const getDisplayName = WrappedComponent => WrappedComponent.displayName || WrappedComponent.name || 'Component';

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
        this.subscriptions = [];
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
        if (!this.state.subscribed && this.client) {
          this.subscribe();
        }
      }

      componentWillUnmount() {
        // make sure to dispose all subscriptions
        this.subscriptions.forEach( s => s.dispose ? s.dispose() : null );
      }

      getDataNames(props) {
        if (Array.isArray(mapDataToProps)) {
          return mapDataToProps.reduce(
            (acc, s) => { acc[s.name] = []; return acc; },
            {}
          );
        } else if (isPlainObject(mapDataToProps)) {
          return  this.getObjectWithArrays(
            Object.keys(mapDataToProps)
          );
        } else {
          return this.getObjectWithArrays(
            Object.keys(mapDataToProps(props))
          );
        }
      }

      getObjectWithArrays(keys) {
        return keys.reduce( (acc, name) => {
          acc[name] = false;
          return acc;
        }, {});
      }

      /**
       * Walk through all elements in mapData and set up
       * the subscriptions which should fire setState() every
       * time data changes.
       */
      subscribe() {
        if (Array.isArray(mapDataToProps)) {
          this.subscribeToArray();
        } else if (isPlainObject(mapDataToProps)){
          this.subscribeToObject();
        } else {
          this.subscribeToFunction();
        }

        this.setState({ subscribed: true });
      }

      subscribeToArray() {
        this.subscriptions = mapDataToProps.reduce(
          (acc, { query, name }) => {
            acc.push(
              query(this.client, this.props)
              .watch()
              .forEach(this.handleData.bind(this, name))
            );

            return acc;
          },
          []
        );
      }

      subscribeToObject() {
        this.subscriptions = Object.keys(mapDataToProps).reduce(
          (acc, name) => {
            const query = mapDataToProps[name];

            acc.push(
              query(this.client, this.props)
              .watch()
              .forEach(this.handleData.bind(this, name))
            );

            return acc;
          },
          []
        )
      }

      subscribeToFunction() {
        const subscribeTo = mapDataToProps(this.props);

        for (let name of Object.keys(subscribeTo)) {
          let queryResult;
          const { collection, c, query } = subscribeTo[name];

          const horizonCollection = this.client(collection || c);

          if (query && Object.keys(query).length) {
            queryResult = horizonCollection.findAll(query);
          } else {
            queryResult = horizonCollection;
          }

          this.subscriptions.push(queryResult
            .watch()
            .forEach(this.handleData.bind(this, name))
          );
        }
      }

      handleData = (name, docs) => {
        this.setState({
          data: {
            ...this.state.data,
            [name]: docs
          }
        });
      };

      render() {
        return createElement(TargetComponent, {
          ...this.props,
          ...this.state.data,
          horizon: this.client
        });
      }
    }

    const { mapStateToProps, mapDispatchToProps, mergeProps, options } = opts;
    return ReactReduxConnect(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps,
      options
    )(DataSubscriber);
  }
}
