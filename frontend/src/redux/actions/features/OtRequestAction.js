import {
  OTREQUEST_ALL,
  OTREQUEST_GET,
  OTREQUEST_DEL,
  OTREQUEST_PUT,
  OTREQUEST_POST,
  OTREQUEST_LOADING,
  OTREQUEST_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const otRequestCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: OTREQUEST_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/ot-request`,
      {
        ...payload,
      },
    );
    dispatch({ type: OTREQUEST_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: OTREQUEST_ERROR });
    throw new Error(error);
  }
};

export const otRequestAll = (params = {}) => async (dispatch) => {
  try {
    const { name = '', size = 999999, page = 1, me = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/ot-request?name=${name}&size=${size}&page=${page}&me=${me}`,
    );
    if (status === 200) {
      dispatch({ type: OTREQUEST_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: OTREQUEST_ERROR });
    throw new Error(error);
  }
};

export const otRequestGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/ot-request/${id}`,
    );
    if (status === 200) {
      dispatch({ type: OTREQUEST_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: OTREQUEST_ERROR });
    throw new Error(error);
  }
};

export const otRequestPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: OTREQUEST_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/ot-request/${id}`,
      payload,
    );
    dispatch({ type: OTREQUEST_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: OTREQUEST_ERROR });
    throw new Error(error);
  }
};
export const otRequestDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: OTREQUEST_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/ot-request/${id}`,
    );
    dispatch({ type: OTREQUEST_DEL, payload: data });
  } catch (error) {
    const { status } = error.request;
    console.error(error);

    if (status === 403) {
      const message = 'ไม่สามารถลบข้อมูลเนื่องจากยังคงมีข้อมูลอยู่ในหมวดหมู่';
      dispatch({ type: OTREQUEST_ERROR, payload: { message } });
      throw new Error(message);
    } else {
      const message = 'เกิดข้อผิดพลาด';
      dispatch({ type: OTREQUEST_ERROR, payload: { message } });
      throw new Error(message);
    }
  }
};
