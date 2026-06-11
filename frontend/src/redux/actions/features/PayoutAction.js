import {
  PAYOUT_ALL,
  PAYOUT_GET,
  PAYOUT_DEL,
  PAYOUT_PUT,
  PAYOUT_POST,
  PAYOUT_LOADING,
  PAYOUT_ERROR,
  PAYOUT_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const payoutCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: PAYOUT_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/payout`,
      payload,
    );
    dispatch({ type: PAYOUT_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYOUT_ERROR });
    throw new Error(error);
  }
};

export const payoutAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 200, page = 1, ex = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/payout?name=${name}&size=${size}&page=${page}&ex=${ex}`,
    );
    if (status === 200) {
      dispatch({ type: PAYOUT_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYOUT_ERROR });
    throw new Error(error);
  }
};

export const payoutGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/payout/${id}`,
    );
    if (status === 200) {
      dispatch({ type: PAYOUT_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYOUT_ERROR });
    throw new Error(error);
  }
};

export const payoutPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: PAYOUT_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/payout/${id}`,
      payload,
    );
    dispatch({ type: PAYOUT_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYOUT_ERROR });
    throw new Error(error);
  }
};
export const payoutDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: PAYOUT_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/payout/${id}`,
    );
    dispatch({ type: PAYOUT_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYOUT_ERROR });
    throw new Error(error);
  }
};

export const payoutReset = () => async (dispatch) => {
  try {
    dispatch({ type: PAYOUT_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYOUT_ERROR });
    throw new Error(error);
  }
};
