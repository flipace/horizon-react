import { PropTypes, Component, createElement, Children } from 'react';
import { render } from 'react-dom';
import isPlainObject from 'is-plain-object';
import Horizon from '@horizon/client';

/**
 * Initializes connection to Horizon server and passes
 * hzConnected prop to enhanced component.
 */
export default class extends Component {
  static propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
    horizonProps: PropTypes.object,
    children: PropTypes.element.isRequired
  };

  static defaultProps = {
    horizonProps: {}
  };

  static childContextTypes = {
    horizon: PropTypes.func,
    store: PropTypes.object
  };

  getChildContext() {
    return {
      horizon: this.horizon,
      store: this.store
    };
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      hzStatus: false
    };

    // the horizon connection
    this.horizon = Horizon(props.horizonProps);

    // the redux connection
    this.store = props.store;

    // set up connection status callbacks
    this.horizon.onDisconnected(this.onStatus);
    this.horizon.onConnected(this.onStatus);
    // this.horizon.onReady(this.onStatus);
    this.horizon.onSocketError(this.onStatus);

    this.horizon.connect();
  }

  onStatus = (status) => {
    try {
      // timeout is needed since the onConnected callback is not enough
      // to determine ready state
      setTimeout(() => {
        console.log()
        this.setState({
          hzStatus: status,
        });
      }, 250);
    } catch(e) {
      console.error("Error bubbled up to horizon-react", e);
    }
  };

  render() {
    return this.state.hzStatus.type === 'connected'
    ? this.renderConnected()
    : this.renderLoading();
  }

  renderConnected() {
    return Children.only(this.props.children)
  }

  renderLoading() {
    return this.props.loadingComponent
    ? createElement(this.props.loadingComponent)
    : createElement('span');
  }
}
