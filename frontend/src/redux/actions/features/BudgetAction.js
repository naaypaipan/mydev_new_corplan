import {
  BUDGET_ALL,
  BUDGET_GET,
  BUDGET_DEL,
  BUDGET_PUT,
  BUDGET_POST,
  BUDGET_LOADING,
  BUDGET_ERROR,
  BUDGET_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const budgetCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: BUDGET_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/budget`,
      payload,
    );
    dispatch({ type: BUDGET_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: BUDGET_ERROR });
    throw new Error(error);
  }
};

export const budgetAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 999999, page = 1, project_id = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/budget?name=${name}&size=${size}&page=${page}&project_id=${project_id}`,
    );
    if (status === 200) {
      dispatch({ type: BUDGET_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: BUDGET_ERROR });
    throw new Error(error);
  }
};

export const budgetGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/budget/${id}`,
    );
    if (status === 200) {
      dispatch({ type: BUDGET_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: BUDGET_ERROR });
    throw new Error(error);
  }
};

export const budgetPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: BUDGET_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/budget/${id}`,
      payload,
    );
    dispatch({ type: BUDGET_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: BUDGET_ERROR });
    throw new Error(error);
  }
};

export const budgetDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: BUDGET_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/budget/${id}`,
    );
    dispatch({ type: BUDGET_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: BUDGET_ERROR });
    throw new Error(error);
  }
};

export const budgetReset = () => async (dispatch) => {
  try {
    dispatch({ type: BUDGET_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: BUDGET_ERROR });
    throw new Error(error);
  }
};
