import types from './actionTypes';

export const addData = (data, key) => ({ type: types.HZ_ADD_DATA, data, key });
export const changeData = (data, key) => ({ type: types.HZ_CHANGE_DATA, data, key });
export const removeData = (id, key) => ({ type: types.HZ_REMOVE_DATA, id, key });
export const addSubscription = (sub, key) => ({ type: types.HZ_ADD_SUBSCRIPTION, sub, key });
export const removeSubscription = hash => ({ type: types.HZ_REMOVE_SUBSCRIPTION, hash });
