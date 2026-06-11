import {
  SALARYLIST_ALL,
  SALARYLIST_GET,
  SALARYLIST_DEL,
  SALARYLIST_PUT,
  SALARYLIST_POST,
  SALARYLIST_LOADING,
  SALARYLIST_ERROR,
  SALARYLIST_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const salaryListCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: SALARYLIST_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/salary-list`,
      payload,
    );
    dispatch({ type: SALARYLIST_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARYLIST_ERROR });
    throw new Error(error);
  }
};

export const salaryListAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 200, page = 1 } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/salary-list?name=${name}&size=${size}&page=${page}`,
    );
    if (status === 200) {
      dispatch({ type: SALARYLIST_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARYLIST_ERROR });
    throw new Error(error);
  }
};

export const salaryListGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/salary-list/${id}`,
    );
    if (status === 200) {
      dispatch({ type: SALARYLIST_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARYLIST_ERROR });
    throw new Error(error);
  }
};

export const salaryListPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: SALARYLIST_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/salary-list/${id}`,
      payload,
    );
    dispatch({ type: SALARYLIST_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARYLIST_ERROR });
    throw new Error(error);
  }
};
export const salaryListDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: SALARYLIST_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/salary-list/${id}`,
    );
    dispatch({ type: SALARYLIST_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARYLIST_ERROR });
    throw new Error(error);
  }
};

export const salaryListReset = () => async (dispatch) => {
  try {
    dispatch({ type: SALARYLIST_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARYLIST_ERROR });
    throw new Error(error);
  }
};
