import {
  ROLETYPES_ALL,
  ROLETYPES_GET,
  ROLETYPES_DEL,
  ROLETYPES_PUT,
  ROLETYPES_POST,
  ROLETYPES_LOADING,
  ROLETYPES_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const roletypeCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: ROLETYPES_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/role-type`,
      {
        ...payload,
      },
    );
    dispatch({ type: ROLETYPES_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: ROLETYPES_ERROR });
    throw new Error(error);
  }
};

export const roletypeAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 999999, page = 1 } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/role-type?name=${name}&size=${size}&page=${page}`,
    );
    if (status === 200) {
      dispatch({ type: ROLETYPES_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: ROLETYPES_ERROR });
    throw new Error(error);
  }
};

export const roletypeGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/role-type/${id}`,
    );
    if (status === 200) {
      dispatch({ type: ROLETYPES_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: ROLETYPES_ERROR });
    throw new Error(error);
  }
};

export const roletypePut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: ROLETYPES_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/role-type/${id}`,
      payload,
    );
    dispatch({ type: ROLETYPES_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: ROLETYPES_ERROR });
    throw new Error(error);
  }
};
export const roletypeDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: ROLETYPES_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/role-type/${id}`,
    );
    dispatch({ type: ROLETYPES_DEL, payload: data });
  } catch (error) {
    const { status } = error.request;
    console.error(error);

    if (status === 403) {
      const message = 'ไม่สามารถลบข้อมูลเนื่องจากยังคงมีข้อมูลอยู่ในหมวดหมู่';
      dispatch({ type: ROLETYPES_ERROR, payload: { message } });
      throw new Error(message);
    } else {
      const message = 'เกิดข้อผิดพลาด';
      dispatch({ type: ROLETYPES_ERROR, payload: { message } });
      throw new Error(message);
    }
  }
};
