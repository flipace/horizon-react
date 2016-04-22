import { PropTypes, Component, createElement } from 'react';
import Horizon from '@horizon/client';

/**
 * Initializes connection to Horizon server and passes
 * hzConnected prop to enhanced component.
 */
export default (ConnectedComponent) => class extends Component {
  static defaultProps = {
    secure: false,
    authType: 'anonymous'
  };

  static childContextTypes = {
    horizon: PropTypes.func
  };

  getChildContext() {
    return { horizon: this.horizon };
  }

  constructor(props) {
    super(props);

    this.state = {
      ready: false
    };

    this.horizon = Horizon({ secure: props.secure, authType: props.authType });
    this.horizon.onReady(this.onReady);
    this.horizon.connect();
  }

  onReady = () => {
    this.setState({
      ready: true
    });
  };

  render() {
    return this.state.ready
    ? this.renderConnected()
    : this.renderLoading();
  }

  renderConnected() {
    return createElement(ConnectedComponent, {
      ...this.props,
      horizonReady: this.state.ready,
      horizon: this.horizon
    });
  }

  renderLoading() {
    return this.props.loadingComponent
    ? createElement(this.props.loadingComponent)
    : null;
  }
}
