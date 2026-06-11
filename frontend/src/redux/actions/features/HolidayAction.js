import {
  HOLIDAY_ALL,
  HOLIDAY_GET,
  HOLIDAY_DEL,
  HOLIDAY_PUT,
  HOLIDAY_POST,
  HOLIDAY_LOADING,
  HOLIDAY_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const holidayCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: HOLIDAY_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/holiday`,
      {
        ...payload,
      },
    );
    dispatch({ type: HOLIDAY_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: HOLIDAY_ERROR });
    throw new Error(error);
  }
};

export const holidayAll = (params = {}) => async (dispatch) => {
  try {
    const { name = '', size = null, page = 1, date = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/holiday?name=${name}&size=${size}&page=${page}&date=${date}`,
    );
    if (status === 200) {
      dispatch({ type: HOLIDAY_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: HOLIDAY_ERROR });
    throw new Error(error);
  }
};

export const holidayGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/holiday/${id}`,
    );
    if (status === 200) {
      dispatch({ type: HOLIDAY_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: HOLIDAY_ERROR });
    throw new Error(error);
  }
};

export const holidayPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: HOLIDAY_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/holiday/${id}`,
      payload,
    );
    dispatch({ type: HOLIDAY_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: HOLIDAY_ERROR });
    throw new Error(error);
  }
};
export const holidayDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: HOLIDAY_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/holiday/${id}`,
    );
    dispatch({ type: HOLIDAY_DEL, payload: data });
  } catch (error) {
    const { status } = error.request;
    console.error(error);

    if (status === 403) {
      const message = 'ไม่สามารถลบข้อมูลเนื่องจากยังคงมีข้อมูลอยู่ในหมวดหมู่';
      dispatch({ type: HOLIDAY_ERROR, payload: { message } });
      throw new Error(message);
    } else {
      const message = 'เกิดข้อผิดพลาด';
      dispatch({ type: HOLIDAY_ERROR, payload: { message } });
      throw new Error(message);
    }
  }
};
