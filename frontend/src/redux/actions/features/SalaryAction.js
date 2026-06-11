import {
  SALARY_ALL,
  SALARY_GET,
  SALARY_DEL,
  SALARY_PUT,
  SALARY_POST,
  SALARY_LOADING,
  SALARY_ERROR,
  SALARY_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const salaryCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: SALARY_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/salary`,
      payload,
    );
    dispatch({ type: SALARY_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARY_ERROR });
    throw new Error(error);
  }
};

export const salaryAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 200, page = 1, bill = '', profile } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/salary?name=${name}&size=${size}&page=${page}&bill=${bill}&profile=${profile}`,
    );
    if (status === 200) {
      dispatch({ type: SALARY_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARY_ERROR });
    throw new Error(error);
  }
};

export const salaryManpower = (params) => async (dispatch) => {
  try {
    const { name = '', profile = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/salary/manpower?name=${name}&profile=${profile}`,
    );
    if (status === 200) {
      dispatch({ type: SALARY_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARY_ERROR });
    throw new Error(error);
  }
};

export const salaryGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/salary/${id}`,
    );
    if (status === 200) {
      dispatch({ type: SALARY_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARY_ERROR });
    throw new Error(error);
  }
};

export const salaryPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: SALARY_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/salary/${id}`,
      payload,
    );
    dispatch({ type: SALARY_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARY_ERROR });
    throw new Error(error);
  }
};
export const salaryDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: SALARY_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/salary/${id}`,
    );
    dispatch({ type: SALARY_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARY_ERROR });
    throw new Error(error);
  }
};

export const salaryReset = () => async (dispatch) => {
  try {
    dispatch({ type: SALARY_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: SALARY_ERROR });
    throw new Error(error);
  }
};
