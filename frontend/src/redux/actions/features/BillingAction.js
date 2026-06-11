import {
  BILLING_ALL,
  BILLING_GET,
  BILLING_DEL,
  BILLING_PUT,
  BILLING_POST,
  BILLING_LOADING,
  BILLING_ERROR,
  BILLING_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const billingCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: BILLING_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/billing`,
      payload,
    );
    dispatch({ type: BILLING_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: BILLING_ERROR });
    throw new Error(error);
  }
};

export const billingAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 999999, page = 1, project_id = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/billing?name=${name}&size=${size}&page=${page}&project_id=${project_id}`,
    );
    if (status === 200) {
      dispatch({ type: BILLING_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: BILLING_ERROR });
    throw new Error(error);
  }
};

export const billingGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/billing/${id}`,
    );
    if (status === 200) {
      dispatch({ type: BILLING_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: BILLING_ERROR });
    throw new Error(error);
  }
};

export const billingPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: BILLING_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/billing/${id}`,
      payload,
    );
    dispatch({ type: BILLING_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: BILLING_ERROR });
    throw new Error(error);
  }
};

export const billingDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: BILLING_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/billing/${id}`,
    );
    dispatch({ type: BILLING_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: BILLING_ERROR });
    throw new Error(error);
  }
};

export const billingReset = () => async (dispatch) => {
  try {
    dispatch({ type: BILLING_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: BILLING_ERROR });
    throw new Error(error);
  }
};
