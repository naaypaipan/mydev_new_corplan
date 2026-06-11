import {
  DEPARTMENT_ALL,
  DEPARTMENT_GET,
  DEPARTMENT_DEL,
  DEPARTMENT_PUT,
  DEPARTMENT_POST,
  DEPARTMENT_LOADING,
  DEPARTMENT_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const departmentCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: DEPARTMENT_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/department`,
      {
        ...payload,
      },
    );
    dispatch({ type: DEPARTMENT_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: DEPARTMENT_ERROR });
    throw new Error(error);
  }
};

export const departmentAll =
  (params = {}) =>
  async (dispatch) => {
    try {
      const { name = '', size = null, page = 1 } = params;
      const { data, status } = await api.get(
        `${process.env.REACT_APP_API_URL}/department?name=${name}&size=${size}&page=${page}`,
      );
      if (status === 200) {
        dispatch({ type: DEPARTMENT_ALL, payload: data });
      }
    } catch (error) {
      console.error(error);
      dispatch({ type: DEPARTMENT_ERROR });
      throw new Error(error);
    }
  };

export const departmentGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/department/${id}`,
    );
    if (status === 200) {
      dispatch({ type: DEPARTMENT_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: DEPARTMENT_ERROR });
    throw new Error(error);
  }
};

export const departmentPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: DEPARTMENT_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/department/${id}`,
      payload,
    );
    dispatch({ type: DEPARTMENT_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: DEPARTMENT_ERROR });
    throw new Error(error);
  }
};
export const departmentDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: DEPARTMENT_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/department/${id}`,
    );
    dispatch({ type: DEPARTMENT_DEL, payload: data });
  } catch (error) {
    const { status } = error.request;
    console.error(error);

    if (status === 403) {
      const message = 'ไม่สามารถลบข้อมูลเนื่องจากยังคงมีข้อมูลอยู่ในหมวดหมู่';
      dispatch({ type: DEPARTMENT_ERROR, payload: { message } });
      throw new Error(message);
    } else {
      const message = 'เกิดข้อผิดพลาด';
      dispatch({ type: DEPARTMENT_ERROR, payload: { message } });
      throw new Error(message);
    }
  }
};
