import {
  PAYIN_ALL,
  PAYIN_GET,
  PAYIN_DEL,
  PAYIN_PUT,
  PAYIN_POST,
  PAYIN_LOADING,
  PAYIN_ERROR,
  PAYIN_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const payinCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: PAYIN_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/payin`,
      payload,
    );
    dispatch({ type: PAYIN_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYIN_ERROR });
    throw new Error(error);
  }
};

export const payinAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 200, page = 1, bill = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/payin?name=${name}&size=${size}&page=${page}&bill=${bill}`,
    );
    if (status === 200) {
      dispatch({ type: PAYIN_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYIN_ERROR });
    throw new Error(error);
  }
};

export const payinGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/payin/${id}`,
    );
    if (status === 200) {
      dispatch({ type: PAYIN_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYIN_ERROR });
    throw new Error(error);
  }
};

export const payinPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: PAYIN_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/payin/${id}`,
      payload,
    );
    dispatch({ type: PAYIN_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYIN_ERROR });
    throw new Error(error);
  }
};
export const payinDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: PAYIN_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/payin/${id}`,
    );
    dispatch({ type: PAYIN_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYIN_ERROR });
    throw new Error(error);
  }
};

export const payinReset = () => async (dispatch) => {
  try {
    dispatch({ type: PAYIN_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYIN_ERROR });
    throw new Error(error);
  }
};
