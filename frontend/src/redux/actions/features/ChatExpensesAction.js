import {
  CHATEXPENSES_ALL,
  CHATEXPENSES_GET,
  CHATEXPENSES_DEL,
  CHATEXPENSES_PUT,
  CHATEXPENSES_POST,
  CHATEXPENSES_LOADING,
  CHATEXPENSES_ERROR,
  CHATEXPENSES_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const chatExpensesCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: CHATEXPENSES_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/chat-expenses`,
      payload,
    );
    dispatch({ type: CHATEXPENSES_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: CHATEXPENSES_ERROR });
    throw new Error(error);
  }
};

export const chatExpensesAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 200, page = 1, ex = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/chat-expenses?name=${name}&size=${size}&page=${page}&ex=${ex}`,
    );
    if (status === 200) {
      dispatch({ type: CHATEXPENSES_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: CHATEXPENSES_ERROR });
    throw new Error(error);
  }
};

export const chatExpensesGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/chat-expenses/${id}`,
    );
    if (status === 200) {
      dispatch({ type: CHATEXPENSES_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: CHATEXPENSES_ERROR });
    throw new Error(error);
  }
};

export const chatExpensesPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: CHATEXPENSES_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/chat-expenses/${id}`,
      payload,
    );
    dispatch({ type: CHATEXPENSES_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: CHATEXPENSES_ERROR });
    throw new Error(error);
  }
};
export const chatExpensesDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: CHATEXPENSES_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/chat-expenses/${id}`,
    );
    dispatch({ type: CHATEXPENSES_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: CHATEXPENSES_ERROR });
    throw new Error(error);
  }
};

export const chatExpensesReset = () => async (dispatch) => {
  try {
    dispatch({ type: CHATEXPENSES_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: CHATEXPENSES_ERROR });
    throw new Error(error);
  }
};
