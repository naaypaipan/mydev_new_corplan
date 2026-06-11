import {
  CUSTOMER_ALL,
  CUSTOMER_GET,
  CUSTOMER_DEL,
  CUSTOMER_PUT,
  CUSTOMER_POST,
  CUSTOMER_LOADING,
  CUSTOMER_ERROR,
  CUSTOMER_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const customerCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: CUSTOMER_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/customer`,
      payload,
    );
    dispatch({ type: CUSTOMER_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: CUSTOMER_ERROR });
    throw new Error(error?.response?.data?.error?.message);
  }
};

/**
 * @typedef {Object} CustomerAllParam
 * @property {string} name
 * @property {number} page
 * @property {number} size
 * @property {string} customerType
 * @param {CustomerAllParam} params
 *
 */
export const customerAll =
  (params = {}) =>
  async (dispatch) => {
    try {
      const { name = '', size = null, page = 1, customerType = '' } = params;
      const { data, status } = await api.get(
        `${process.env.REACT_APP_API_URL}/customer?name=${name}&size=${size}&page=${page}&customerType=${customerType}`,
      );
      if (status === 200) {
        dispatch({ type: CUSTOMER_ALL, payload: data });
      }
    } catch (error) {
      console.error(error);
      dispatch({ type: CUSTOMER_ERROR });
      throw new Error(error?.response?.data?.error?.message);
    }
  };

export const customerGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/customer/${id}`,
    );
    if (status === 200) {
      dispatch({ type: CUSTOMER_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: CUSTOMER_ERROR });
    throw new Error(error?.response?.data?.error?.message);
  }
};

export const customerPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: CUSTOMER_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/customer/${id}`,
      payload,
    );
    dispatch({ type: CUSTOMER_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: CUSTOMER_ERROR });
    throw new Error(error?.response?.data?.error?.message);
  }
};
export const customerDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: CUSTOMER_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/customer/${id}`,
    );
    dispatch({ type: CUSTOMER_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: CUSTOMER_ERROR });
    throw new Error(error?.response?.data?.error?.message);
  }
};

export const customerReset = () => async (dispatch) => {
  try {
    dispatch({ type: CUSTOMER_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: CUSTOMER_ERROR });
    throw new Error(error);
  }
};
