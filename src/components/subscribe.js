import { Component, PropTypes, createElement } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import isPlainObject from 'is-plain-object';

/**
 * Subscribes to data specified in mapData
 */
export default function subscribe(mapData = () => ({})) {
  return (TargetComponent) => {
    class DataSubscriber extends Component {
      static contextTypes = {
        horizon: PropTypes.func
      };

      constructor(props) {
        super(props);

        // generate data object which will hold subscription documents
        const data = this.getDataNames(props);

        this.state = {
          subscribed: false,
          updates: 0,
          data
        };

        // this will hold all active subscriptions
        this.subscriptions = [];
      }

      getDataNames(props) {
        if (Array.isArray(mapData)) {
          return mapData.reduce(
            (acc, s) => { acc[s.name] = []; return acc; },
            {}
          );
        } else if (isPlainObject(mapData)) {
          return  this.getObjectWithArrays(
            Object.keys(mapData)
          );
        } else {
          return this.getObjectWithArrays(
            Object.keys(mapData(props))
          );
        }
      }

      getObjectWithArrays(keys) {
        return keys.reduce( (acc, name) => {
          acc[name] = [];
          return acc;
        }, {});
      }

      componentDidMount() {
        if (!this.state.subscribed && this.context.horizon) {
          this.subscribe();
        }
      }

      /**
       * Walk through all elements in mapData and set up
       * the subscriptions which should fire setState() every
       * time data changes.
       */
      subscribe() {
        if (Array.isArray(mapData)) {
          this.subscribeToArray();
        } else if (isPlainObject(mapData)){
          this.subscribeToObject();
        } else {
          this.subscribeToFunction();
        }

        this.setState({ subscribed: true });
      }

      subscribeToArray() {
        this.subscriptions = mapData.reduce(
          (acc, { query, name }) => {
            acc.push(
              query(this.context.horizon, this.props)
              .watch()
              .forEach(this.handleData.bind(this, name))
            );

            return acc;
          },
          []
        );
      }

      subscribeToObject() {
        this.subscriptions = Object.keys(mapData).reduce(
          (acc, name) => {
            const query = mapData[name].query;

            acc.push(
              query(this.context.horizon, this.props)
              .watch()
              .forEach(this.handleData.bind(this, name))
            );

            return acc;
          },
          []
        )
      }

      subscribeToFunction() {
        const subscribeTo = mapData(this.props);

        for (let name of Object.keys(subscribeTo)) {
          let queryResult;
          const { collection, c, query } = subscribeTo[name];

          const horizonCollection = this.context.horizon(collection || c);

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

      componentWillUnmount() {
        // make sure to dispose all subscriptions
        this.subscriptions.forEach( s => s.dispose() );
      }

      render() {
        return createElement(TargetComponent, {
          ...this.props,
          ...this.state.data,
          horizon: this.context.horizon
        });
      }
    }

    return hoistStatics(DataSubscriber, TargetComponent);
  }
}
