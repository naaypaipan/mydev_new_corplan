import {
  PAYMENT_ALL,
  PAYMENT_GET,
  PAYMENT_DEL,
  PAYMENT_PUT,
  PAYMENT_POST,
  PAYMENT_LOADING,
  PAYMENT_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const paymentCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/payment_api`,
      {
        ...payload,
      },
    );
    dispatch({ type: PAYMENT_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYMENT_ERROR });
    throw new Error(error);
  }
};

export const paymentAll = (params = {}) => async (dispatch) => {
  try {
    const { name = '', size = null, page = 1, date = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/payment_api?name=${name}&size=${size}&page=${page}&date=${date}`,
    );
    if (status === 200) {
      dispatch({ type: PAYMENT_ALL, payload: data });
      return data;
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYMENT_ERROR });
    throw new Error(error);
  }
};
export const paymentCreateWithExpenses = (payload) => async (dispatch) => {
  try {
    const {
      data,
      status,
    } = await api.post(
      `${process.env.REACT_APP_API_URL}/payment_api/with-expenses`,
      { ...payload },
    );
    if (status === 200) {
      dispatch({ type: PAYMENT_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYMENT_ERROR });
    throw new Error(error);
  }
};

export const paymentPrepareByPayee = (payload = {}) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/payment_api/prepare-by-payee`,
      { ...payload },
    );
    return data;
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYMENT_ERROR });
    throw error;
  }
};

export const paymentComplete = (paymentId, payload = {}) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/payment_api/${paymentId}/complete`,
      { ...payload },
    );
    return data;
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYMENT_ERROR });
    throw error;
  }
};

export const paymentGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/payment_api/${id}`,
    );
    if (status === 200) {
      dispatch({ type: PAYMENT_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYMENT_ERROR });
    throw new Error(error);
  }
};

export const paymentPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/payment_api/${id}`,
      payload,
    );
    dispatch({ type: PAYMENT_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYMENT_ERROR });
    throw new Error(error);
  }
};
export const paymentDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/payment_api/${id}`,
    );
    dispatch({ type: PAYMENT_DEL, payload: data });
  } catch (error) {
    const { status } = error.request;
    console.error(error);

    if (status === 403) {
      const message = 'ไม่สามารถลบข้อมูลเนื่องจากยังคงมีข้อมูลอยู่ในหมวดหมู่';
      dispatch({ type: PAYMENT_ERROR, payload: { message } });
      throw new Error(message);
    } else {
      const message = 'เกิดข้อผิดพลาด';
      dispatch({ type: PAYMENT_ERROR, payload: { message } });
      throw new Error(message);
    }
  }
};
