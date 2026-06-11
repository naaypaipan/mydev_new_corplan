import {
  OTREQUESTORDER_ALL,
  OTREQUESTORDER_GET,
  OTREQUESTORDER_DEL,
  OTREQUESTORDER_PUT,
  OTREQUESTORDER_POST,
  OTREQUESTORDER_LOADING,
  OTREQUESTORDER_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const otRequestOrderCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: OTREQUESTORDER_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/ot-request-order`,
      {
        ...payload,
      },
    );
    dispatch({ type: OTREQUESTORDER_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: OTREQUESTORDER_ERROR });
    throw error;
  }
};
export const otRequestOrderCreateWithNotify = (payload) => async (dispatch) => {
  try {
    dispatch({ type: OTREQUESTORDER_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/ot-request-order/hr`,
      {
        ...payload,
      },
    );
    dispatch({ type: OTREQUESTORDER_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: OTREQUESTORDER_ERROR });
    throw error;
  }
};

export const otRequestOrderAll = (params = {}) => async (dispatch) => {
  try {
    const { name = '', size = 999999, page = 1, me = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/ot-request-order?name=${name}&size=${size}&page=${page}&me=${me}`,
    );
    if (status === 200) {
      dispatch({ type: OTREQUESTORDER_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: OTREQUESTORDER_ERROR });
    throw new Error(error);
  }
};

export const otRequestOrderGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/ot-request-order/${id}`,
    );
    if (status === 200) {
      dispatch({ type: OTREQUESTORDER_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: OTREQUESTORDER_ERROR });
    throw new Error(error);
  }
};

export const otRequestOrderPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: OTREQUESTORDER_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/ot-request-order/${id}`,
      payload,
    );
    dispatch({ type: OTREQUESTORDER_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: OTREQUESTORDER_ERROR });
    throw new Error(error);
  }
};
export const otRequestOrderDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: OTREQUESTORDER_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/ot-request-order/${id}`,
    );
    dispatch({ type: OTREQUESTORDER_DEL, payload: data });
  } catch (error) {
    const { status } = error.request;
    console.error(error);

    if (status === 403) {
      const message = 'ไม่สามารถลบข้อมูลเนื่องจากยังคงมีข้อมูลอยู่ในหมวดหมู่';
      dispatch({ type: OTREQUESTORDER_ERROR, payload: { message } });
      throw new Error(message);
    } else {
      const message = 'เกิดข้อผิดพลาด';
      dispatch({ type: OTREQUESTORDER_ERROR, payload: { message } });
      throw new Error(message);
    }
  }
};
