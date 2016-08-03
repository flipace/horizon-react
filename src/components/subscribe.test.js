import { describe } from 'ava-spec';
import React from 'react';
import { mount } from 'enzyme';

import HorizonMock from '../utils/test/HorizonMock';
import { createStore } from 'redux';

import subscribe from './subscribe';

describe('no options:', (test) => {
  test('it should not require any mapping to subscribe', (t) => {
    t.plan(1);
    const horizon = HorizonMock();
    const store = createStore((state) => state);
    const SubscribedComponent = subscribe()(() => <div></div>);
    mount(<SubscribedComponent store={store} client={horizon} />);
    t.pass();
  });
});

describe('#mapDataToProps:', (test) => {
  test('it should pass horizon client instance to mapDataToProps function', (t) => {
    t.plan(1);
    const horizon = HorizonMock();
    const store = createStore((state) => state);
    const SubscribedComponent = subscribe({
      mapDataToProps: {
        widgets: (hz) => {
          t.true(hz === horizon);
          return hz('widgets');
        }
      }
    })(() => <div></div>);
    mount(<SubscribedComponent store={store} client={horizon} />);
  });

  test('it should pass props to mapDataToProps function', (t) => {
    t.plan(1);
    const horizon = HorizonMock();
    const store = createStore((state) => state);
    const SubscribedComponent = subscribe({
      mapDataToProps: {
        widgets: (hz, props) => {
          t.true(!!props);
          return hz('widgets');
        }
      }
    })(() => <div></div>);
    mount(<SubscribedComponent store={store} client={horizon} />);
  });
});
