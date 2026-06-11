import {
  CUSTOMER_TYPE_ALL,
  CUSTOMER_TYPE_GET,
  CUSTOMER_TYPE_DEL,
  CUSTOMER_TYPE_PUT,
  CUSTOMER_TYPE_POST,
  CUSTOMER_TYPE_LOADING,
  CUSTOMER_TYPE_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const customerTypeCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: CUSTOMER_TYPE_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/customer-type`,
      payload,
    );
    dispatch({ type: CUSTOMER_TYPE_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: CUSTOMER_TYPE_ERROR });
    throw new Error(error);
  }
};

export const customerTypeAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = null, page = 1 } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/customer-type?name=${name}&size=${size}&page=${page}`,
    );
    if (status === 200) {
      dispatch({ type: CUSTOMER_TYPE_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: CUSTOMER_TYPE_ERROR });
    throw new Error(error);
  }
};

export const customerTypeGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/customer-type/${id}`,
    );
    if (status === 200) {
      dispatch({ type: CUSTOMER_TYPE_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: CUSTOMER_TYPE_ERROR });
    throw new Error(error);
  }
};

export const customerTypePut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: CUSTOMER_TYPE_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/customer-type/${id}`,
      payload,
    );
    dispatch({ type: CUSTOMER_TYPE_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: CUSTOMER_TYPE_ERROR });
    throw new Error(error);
  }
};
export const customerTypeDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: CUSTOMER_TYPE_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/customer-type/${id}`,
    );
    dispatch({ type: CUSTOMER_TYPE_DEL, payload: data });
  } catch (error) {
    const { status } = error.request;
    console.error(error);

    if (status === 403) {
      const message = 'ไม่สามารถลบข้อมูลเนื่องจากยังคงมีข้อมูลอยู่ในหมวดหมู่';
      dispatch({ type: CUSTOMER_TYPE_ERROR, payload: { message } });
      throw new Error(message);
    } else {
      const message = 'เกิดข้อผิดพลาด';
      dispatch({ type: CUSTOMER_TYPE_ERROR, payload: { message } });
      throw new Error(message);
    }
  }
};
