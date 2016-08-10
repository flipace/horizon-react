import { describe } from 'ava-spec';

import deleteDoc from './deleteDoc';

describe('interface:', (test) => {
  const MOCK_DOC = {};
  test('it should call `remove` once', (t) => {
    let called = 0;
    deleteDoc({
      remove: () => {
        called++;
      }
    });
    t.true(called === 1);
  });
  test('it should call `remove` with the passed doc', (t) => {
    deleteDoc({
      remove: (doc) => {
        t.true(doc === MOCK_DOC);
      }
    }, MOCK_DOC);
  });
});
