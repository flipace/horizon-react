import { describe } from 'ava-spec';
import React from 'react';
import { mount } from 'enzyme';

import HorizonMock from '../utils/test/HorizonMock';
import { createStore } from 'redux';

import Connector from './Connector';

describe('Children render:', (test) => {
  const DIV_ID = 'content';
  test('it should render the passed children when (state === "ready")', (t) => {
    t.plan(1);
    const store = createStore((state) => state);
    const horizon = HorizonMock();
    const mounted = mount(
      <Connector
        horizon={horizon}
        store={store}
      >
        <div id={DIV_ID}></div>
      </Connector>
    );
    t.true(mounted.find(`div#${DIV_ID}`).length === 1);
  });

  test('it should render nothing when (state !== "ready") and no `loadingComponent` is passed',
    (t) => {
      t.plan(1);
      const store = createStore((state) => state);
      const horizon = HorizonMock({
        status: () => ({
          getValue() {
            return { type: 'notready' };
          }
        })
      });
      const mounted = mount(
        <Connector
          horizon={horizon}
          store={store}
        >
          <div id={DIV_ID}></div>
        </Connector>
      );
      t.true(mounted.find(`div#${DIV_ID}`).length === 0);
    }
  );

  test('it should render `loadingComponent` when (state !== "ready")', (t) => {
    t.plan(1);
    const LOADING_ID = 'loading';
    const store = createStore((state) => state);
    const horizon = HorizonMock({
      status: () => ({
        getValue() {
          return { type: 'notready' };
        }
      })
    });
    const mounted = mount(
      <Connector
        horizon={horizon}
        store={store}
        loadingComponent={() => <span id={LOADING_ID}></span>}
      >
        <div id={DIV_ID}></div>
      </Connector>
    );
    t.true(mounted.find(`span#${LOADING_ID}`).length === 1);
  });
});
