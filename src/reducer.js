import Immutable from 'immutable';
import types from './actionTypes';

const initialState = Immutable.fromJS({
  data: {},
  subscriptions: {}
});

const reducerMap = {
  [types.HZ_ADD_DATA] : (state, { payload: { key, data } }) => {
    const path = ['data', key];

    if (!state.hasIn(path)) {
      return state.setIn(path, Immutable.fromJS([data]));
    }

    const newList = Immutable.fromJS([
      ...state.getIn(path).toJS(),
      Immutable.fromJS(data)
    ]);

    return state.setIn(path, newList);
  },
  [types.HZ_CHANGE_DATA] : (state, { payload: { key, data } }) => {
    const path = ['data', key];
    const index = state.getIn(['data', key])
      .findIndex(d => d.get('id') === data.id);

    return state.setIn(
      path,
      state.getIn(path).set(index, Immutable.fromJS(data))
    );
  },
  [types.HZ_REMOVE_DATA] : (state, { payload: { key, id } }) => {
    return state.setIn(
      ['data', key],
      state.getIn(['data', key]).filter( d => {
        return d.get('id') !== id
      })
    );
  },
  [types.HZ_ADD_SUBSCRIPTION] : (state, { payload: { key, sub } }) => {
    if (state.getIn(['subscriptions', key]) !== sub) {
      return state.setIn(['subscriptions', key], Immutable.fromJS(sub));
    }

    return state;
  },
  [types.HZ_REMOVE_SUBSCRIPTION] : (state, { payload: { hash } }) => {
    if (state.hasIn(['subscriptions', hash])) {
      return state.deleteIn(['subscriptions', hash]);
    }

    return state;
  }
};

function createReducer (initialState, reducerMap) {
  return (state = initialState, action) => {
    const reducer = reducerMap[action.type];
    return reducer ? reducer(state, { type: action.type, payload: _.omit(action, 'type') }) : state;
  };
}

export default createReducer(initialState, reducerMap);
