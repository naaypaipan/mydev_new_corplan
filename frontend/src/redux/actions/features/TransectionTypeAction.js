import {
  TRANSECTIONTYPE_ALL,
  TRANSECTIONTYPE_GET,
  TRANSECTIONTYPE_DEL,
  TRANSECTIONTYPE_PUT,
  TRANSECTIONTYPE_POST,
  TRANSECTIONTYPE_LOADING,
  TRANSECTIONTYPE_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const transectiontypeCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: TRANSECTIONTYPE_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/transectiontype`,
      {
        ...payload,
      },
    );
    dispatch({ type: TRANSECTIONTYPE_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: TRANSECTIONTYPE_ERROR });
    throw new Error(error);
  }
};

export const transectiontypeAll = (params = {}) => async (dispatch) => {
  try {
    const { name = '', size = null, page = 1, date = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/transectiontype?name=${name}&size=${size}&page=${page}&date=${date}`,
    );
    if (status === 200) {
      dispatch({ type: TRANSECTIONTYPE_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TRANSECTIONTYPE_ERROR });
    throw new Error(error);
  }
};

export const transectiontypeGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/transectiontype/${id}`,
    );
    if (status === 200) {
      dispatch({ type: TRANSECTIONTYPE_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TRANSECTIONTYPE_ERROR });
    throw new Error(error);
  }
};

export const transectiontypePut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: TRANSECTIONTYPE_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/transectiontype/${id}`,
      payload,
    );
    dispatch({ type: TRANSECTIONTYPE_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: TRANSECTIONTYPE_ERROR });
    throw new Error(error);
  }
};
export const transectiontypeDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: TRANSECTIONTYPE_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/transectiontype/${id}`,
    );
    dispatch({ type: TRANSECTIONTYPE_DEL, payload: data });
  } catch (error) {
    const { status } = error.request;
    console.error(error);

    if (status === 403) {
      const message = 'ไม่สามารถลบข้อมูลเนื่องจากยังคงมีข้อมูลอยู่ในหมวดหมู่';
      dispatch({ type: TRANSECTIONTYPE_ERROR, payload: { message } });
      throw new Error(message);
    } else {
      const message = 'เกิดข้อผิดพลาด';
      dispatch({ type: TRANSECTIONTYPE_ERROR, payload: { message } });
      throw new Error(message);
    }
  }
};
