import { describe } from 'ava-spec';
import React from 'react';
import proxyquire from 'proxyquire';
import { mount } from 'enzyme';

import HorizonMock, { horizonSub } from '../utils/test/HorizonMock';
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

describe('no redux:', (test) => {
  test('it should not throw an error when redux is not found', (t) => {
    t.plan(1);
    const wrongSubscribe = proxyquire('./subscribe', {
      '../utils/requireResolve': {
        default: (path) => {
          if (path === 'redux') {
            throw new Error(`Cannot find module '${path}'`);
          }
          return require.resolve(path);
        }
      }
    }).default;
    const horizon = HorizonMock();
    const SubscribedComponent = wrongSubscribe()(() => <div></div>);
    const mockedStore = {
      subscribe() {},
      dispatch() {},
      getState: () => ({})
    };
    mount(<SubscribedComponent store={mockedStore} client={horizon} />);
    t.pass();
  });

  test('it should work with a mocked redux store', (t) => {
    t.plan(1);
    const horizon = HorizonMock();
    const SubscribedComponent = subscribe()(() => <div></div>);
    const mockedStore = {
      subscribe() {},
      dispatch() {},
      getState: () => ({})
    };
    mount(<SubscribedComponent store={mockedStore} client={horizon} />);
    t.pass();
  });

  test('it should fail with an incompletely mocked redux store', (t) => {
    t.plan(1);
    const horizon = HorizonMock();
    const SubscribedComponent = subscribe()(() => <div></div>);
    const mockedStore = {
      getState: () => ({})
    };

    const oldError = console.error;
    console.error = (error) => {
      if (/Required prop \`store\.subscribe\` was not specified/.test(error)) {
        return t.pass();
      }
      oldError(error);
      console.error = oldError;
    };
    mount(<SubscribedComponent store={mockedStore} client={horizon} />);
  });
});

describe('#mapDataToProps(array):', (test) => {
  test('it should call all array functions', (t) => {
    t.plan(2);
    const horizon = HorizonMock();
    const store = createStore((state) => state);
    const SubscribedComponent = subscribe({
      mapDataToProps: [
        {
          name: 'widgets',
          query: (hz) => {
            t.pass();
            return hz('widgets');
          }
        },
        {
          name: 'widgets2',
          query: (hz) => {
            t.pass();
            return hz('widgets2');
          }
        }
      ]
    })(() => <div></div>);
    mount(<SubscribedComponent store={store} client={horizon} />);
  });
});

describe('#mapDataToProps(plainObject):', (test) => {
  test('it should call all key functions', (t) => {
    t.plan(2);
    const horizon = HorizonMock();
    const store = createStore((state) => state);
    const SubscribedComponent = subscribe({
      mapDataToProps: {
        widgets: (hz) => {
          t.pass();
          return hz('widgets');
        },
        widgets2: (hz) => {
          t.pass();
          return hz('widgets2');
        }
      }
    })(() => <div></div>);
    mount(<SubscribedComponent store={store} client={horizon} />);
  });

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

describe('#mapDataToProps(function):', (test) => {
  test('it should call a passed function', (t) => {
    t.plan(2);
    const horizon = HorizonMock();
    const store = createStore((state) => state);
    const SubscribedComponent = subscribe({
      // this function gets called twice
      // #1 getDataNames
      // #2 subscribeToFunction
      mapDataToProps: () => {
        t.pass();
        return {};
      }
    })(() => <div></div>);
    mount(<SubscribedComponent store={store} client={horizon} />);
  });

  test('it should call findAll for returned queryParams', (t) => {
    t.plan(1);
    const query = { name: 'test' };

    function TestHorizonMock() {
      return () => ({
        findAll(passedQuery) {
          t.true(passedQuery === query);
          return horizonSub();
        },
        ...horizonSub()
      });
    }

    const horizon = TestHorizonMock();
    const store = createStore((state) => state);
    const SubscribedComponent = subscribe({
      mapDataToProps: () => ({
        widgets: {
          collection: 'widgets',
          query
        }
      })
    })(() => <div></div>);
    mount(<SubscribedComponent store={store} client={horizon} />);
  });
});

describe('#handleData', (test) => {
  const ChildComponent = (props) => (
    <div>{props.widgets.map((w) => <span key={w.id}>{w.name}</span>)}</div>
  );

  test('it should convert a single object into an array on props', (t) => {
    t.plan(1);
    const horizon = HorizonMock({
      data: {
        id: 1,
        name: 'hello'
      }
    });
    const store = createStore((state) => state);
    const SubscribedComponent = subscribe({
      mapDataToProps: {
        widgets: (hz) => hz('widgets')
      }
    })(ChildComponent);
    const mounted = mount(<SubscribedComponent store={store} client={horizon} />);
    t.true(mounted.find('span').length === 1);
  });

  test('it should pass an array to props', (t) => {
    t.plan(1);
    const horizon = HorizonMock({
      data: [
        {
          id: 1,
          name: 'hello'
        },
        {
          id: 2,
          name: 'hello 2'
        },
        {
          id: 3,
          name: 'hello 3'
        }
      ]
    });
    const store = createStore((state) => state);
    const SubscribedComponent = subscribe({
      mapDataToProps: {
        widgets: (hz) => hz('widgets')
      }
    })(ChildComponent);
    const mounted = mount(<SubscribedComponent store={store} client={horizon} />);
    t.true(mounted.find('div span').length === 3);
  });
});
