import {
  EMPLOYEE_ALL,
  EMPLOYEE_GET,
  EMPLOYEE_DEL,
  EMPLOYEE_PUT,
  EMPLOYEE_POST,
  EMPLOYEE_LOADING,
  EMPLOYEE_ERROR,
  EMPLOYEE_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const employeeCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: EMPLOYEE_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/employee`,
      payload,
    );
    dispatch({ type: EMPLOYEE_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: EMPLOYEE_ERROR });
    throw new Error(error);
  }
};

export const employeeAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 999999, page = 1 } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/employee?name=${name}&size=${size}&page=${page}`,
    );
    if (status === 200) {
      dispatch({ type: EMPLOYEE_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: EMPLOYEE_ERROR });
    throw new Error(error);
  }
};

export const employeeTimestamp = (params) => async (dispatch) => {
  try {
    const { em = '', size = 999999, page = 1, name = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/employee/timestamp?em=${em}&size=${size}&page=${page}&name=${name}`,
    );
    if (status === 200) {
      dispatch({ type: EMPLOYEE_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: EMPLOYEE_ERROR });
    throw new Error(error);
  }
};

export const employeeGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/employee/${id}`,
    );
    if (status === 200) {
      dispatch({ type: EMPLOYEE_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: EMPLOYEE_ERROR });
    throw new Error(error);
  }
};

export const employeePut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: EMPLOYEE_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/employee/${id}`,
      payload,
    );
    dispatch({ type: EMPLOYEE_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: EMPLOYEE_ERROR });
    throw new Error(error);
  }
};
export const employeeDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: EMPLOYEE_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/employee/${id}`,
    );
    dispatch({ type: EMPLOYEE_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: EMPLOYEE_ERROR });
    throw new Error(error);
  }
};

export const employeeReset = () => async (dispatch) => {
  try {
    dispatch({ type: EMPLOYEE_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: EMPLOYEE_ERROR });
    throw new Error(error);
  }
};
