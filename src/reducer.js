import Immutable from 'seamless-immutable';
import omit from 'lodash.omit';
import types from './actionTypes';

const initialState = Immutable({
  data: {},
  subscriptions: {}
});

const reducerMap = {
  [types.HZ_ADD_DATA] : (state, { payload: { key, data } }) => {
    if (typeof state.data[key] === 'undefined') {
      return state.setIn(['data', key], Immutable([data]));
    }

    const newList = Immutable([
      ...state.data[key],
      data
    ]);

    return state.setIn(['data', key], newList);
  },
  [types.HZ_CHANGE_DATA] : (state, { payload: { key, data } }) => {
    const index = state.data[key]
      .findIndex(d => d.id === data.id);

    return state.setIn(
      ['data', key],
      state.data[key].set(index, Immutable(data))
    );
  },
  [types.HZ_REMOVE_DATA] : (state, { payload: { key, id } }) => state.setIn(
      ['data', key],
      state.data[key].filter(d => d.id !== id)
  ),
  [types.HZ_ADD_SUBSCRIPTION] : (state, { payload: { key, sub } }) => {
    if (state.subscriptions[key] !== sub) {
      return state.setIn(['subscriptions', key], Immutable(sub));
    }

    return state;
  },
  [types.HZ_REMOVE_SUBSCRIPTION] : (state, { payload: { hash } }) => {
    if (state.subscriptions[hash]) {
      const newState = state.set('subscriptions', state.subscriptions.without(hash));

      if (newState.data && newState.data[hash]) {
        return newState.set('data', newState.data.without(hash));
      }

      return newState;
    }

    return state;
  }
};

function createReducer (initialState, reducerMap) {
  return (state = initialState, action) => {
    const reducer = reducerMap[action.type];
    return reducer ? reducer(state, { type: action.type, payload: omit(action, 'type') }) : state;
  };
}

export default createReducer(initialState, reducerMap);
