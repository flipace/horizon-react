import { PropTypes, Component, createElement } from 'react';
import { render } from 'react-dom';
import isPlainObject from 'is-plain-object';
import Horizon from '@horizon/client';

/**
 * Initializes connection to Horizon server and passes
 * hzConnected prop to enhanced component.
 */
export default (horizonProps = false, ConnectedComponent) => class extends Component {
  static childContextTypes = {
    horizon: PropTypes.func
  };

  getChildContext() {
    return { horizon: this.horizon };
  }

  constructor(props) {
    super(props);

    this.state = {
      hzStatus: false
    };

    this.horizon = Horizon(
      isPlainObject(horizonProps)
      ? horizonProps
      : {}
    );

    // set up connection status callbacks
    this.horizon.onDisconnected(this.onStatus);
    this.horizon.onConnected(this.onStatus);
    this.horizon.onReady(this.onStatus);
    this.horizon.onSocketError(this.onStatus);

    this.horizon.connect();
  }

  onStatus = (status) => {
    try {
      this.setState({
        hzStatus: status,
      });
    } catch(e) {
      console.error(e);
    }
  };

  render() {
    // wait for https://github.com/rethinkdb/horizon/pull/286 to be merged
    // return this.state.hzStatus.type === Horizon.constants.connection.STATUS_READY.type
    return this.state.hzStatus.type === 'ready'
    ? this.renderConnected()
    : this.renderLoading();
  }

  renderConnected() {
    const component = isPlainObject(horizonProps)
    ? ConnectedComponent
    : horizonProps;

    return createElement(component, {
      ...this.props,
      horizon: this.horizon
    });
  }

  renderLoading() {
    return this.props.loadingComponent
    ? createElement(this.props.loadingComponent)
    : null;
  }
}
