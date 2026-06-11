import {
  PAYTYPE_ALL,
  PAYTYPE_GET,
  PAYTYPE_DEL,
  PAYTYPE_PUT,
  PAYTYPE_POST,
  PAYTYPE_LOADING,
  PAYTYPE_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const paytypeCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: PAYTYPE_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/paytype`,
      {
        ...payload,
      },
    );
    dispatch({ type: PAYTYPE_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYTYPE_ERROR });
    throw new Error(error);
  }
};

export const paytypeAll = (params = {}) => async (dispatch) => {
  try {
    const { name = '', size = null, page = 1, date = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/paytype?name=${name}&size=${size}&page=${page}&date=${date}`,
    );
    if (status === 200) {
      dispatch({ type: PAYTYPE_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYTYPE_ERROR });
    throw new Error(error);
  }
};

export const paytypeGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/paytype/${id}`,
    );
    if (status === 200) {
      dispatch({ type: PAYTYPE_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYTYPE_ERROR });
    throw new Error(error);
  }
};

export const paytypePut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: PAYTYPE_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/paytype/${id}`,
      payload,
    );
    dispatch({ type: PAYTYPE_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PAYTYPE_ERROR });
    throw new Error(error);
  }
};
export const paytypeDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: PAYTYPE_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/paytype/${id}`,
    );
    dispatch({ type: PAYTYPE_DEL, payload: data });
  } catch (error) {
    const { status } = error.request;
    console.error(error);

    if (status === 403) {
      const message = 'ไม่สามารถลบข้อมูลเนื่องจากยังคงมีข้อมูลอยู่ในหมวดหมู่';
      dispatch({ type: PAYTYPE_ERROR, payload: { message } });
      throw new Error(message);
    } else {
      const message = 'เกิดข้อผิดพลาด';
      dispatch({ type: PAYTYPE_ERROR, payload: { message } });
      throw new Error(message);
    }
  }
};
