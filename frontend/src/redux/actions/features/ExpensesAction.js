import {
  EXPENSES_ALL,
  EXPENSES_GET,
  EXPENSES_DEL,
  EXPENSES_PUT,
  EXPENSES_POST,
  EXPENSES_LOADING,
  EXPENSES_ERROR,
  EXPENSES_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const expensesCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: EXPENSES_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/expenses`,
      payload,
    );
    dispatch({ type: EXPENSES_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: EXPENSES_ERROR });
    throw new Error(error);
  }
};

export const expensesCreateWithOutNotify = (payload) => async (dispatch) => {
  try {
    dispatch({ type: EXPENSES_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/expenses/won`,
      payload,
    );
    dispatch({ type: EXPENSES_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: EXPENSES_ERROR });
    throw new Error(error);
  }
};

export const expensesAll = (params) => async (dispatch) => {
  try {
    const {
      name = '',
      size = 99999,
      page = 1,
      me = '',
      search = '',
      findProject = '',
      dateStart: dateStartParam = '',
      dateEnd: dateEndParam = '',
      status: statusFilter = '',
    } = params;
    const dateStart = dateStartParam instanceof Date ? dateStartParam.toISOString() : dateStartParam;
    const dateEnd = dateEndParam instanceof Date ? dateEndParam.toISOString() : dateEndParam;
    const q = new URLSearchParams({ name, size, page, me, search, findProject });
    if (dateStart) q.set('dateStart', dateStart);
    if (dateEnd) q.set('dateEnd', dateEnd);
    if (statusFilter) q.set('status', statusFilter);
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/expenses?${q.toString()}`,
    );
    if (status === 200) {
      dispatch({ type: EXPENSES_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: EXPENSES_ERROR });
    throw new Error(error);
  }
};

export const expensesGetDaily = (params) => async (dispatch) => {
  try {
    const { date = '', dateStart = '', dateEnd = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/expenses/daily/report?date=${date}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
    );
    if (status === 200) {
      dispatch({ type: EXPENSES_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: EXPENSES_ERROR });
    throw new Error(error);
  }
};

export const expensesGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/expenses/${id}`,
    );
    if (status === 200) {
      dispatch({ type: EXPENSES_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: EXPENSES_ERROR });
    throw new Error(error);
  }
};

export const expensesPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: EXPENSES_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/expenses/${id}`,
      payload,
    );
    dispatch({ type: EXPENSES_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: EXPENSES_ERROR });
    throw new Error(error);
  }
};
export const expensesDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: EXPENSES_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/expenses/${id}`,
    );
    dispatch({ type: EXPENSES_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: EXPENSES_ERROR });
    throw new Error(error);
  }
};

export const expensesRemoveImage = (expensesId, imageId) => async (dispatch) => {
  try {
    dispatch({ type: EXPENSES_LOADING });
    await api.delete(
      `${process.env.REACT_APP_API_URL}/expenses/${expensesId}/images/${imageId}`,
    );
    dispatch({ type: EXPENSES_PUT, payload: {} });
  } catch (error) {
    console.error(error);
    dispatch({ type: EXPENSES_ERROR });
    throw new Error(error);
  }
};

export const expensesReset = () => async (dispatch) => {
  try {
    dispatch({ type: EXPENSES_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: EXPENSES_ERROR });
    throw new Error(error);
  }
};
