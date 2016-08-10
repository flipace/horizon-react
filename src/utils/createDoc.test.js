import { describe } from 'ava-spec';

import createDoc from './createDoc';

describe('interface:', (test) => {
  const MOCK_DOC = {};
  test('it should call `store` once', (t) => {
    let called = 0;
    createDoc({
      store: () => {
        called++;
      }
    });
    t.true(called === 1);
  });
  test('it should call `store` with the passed doc', (t) => {
    createDoc({
      store: (doc) => {
        t.true(doc === MOCK_DOC);
      }
    }, MOCK_DOC);
  });
});
