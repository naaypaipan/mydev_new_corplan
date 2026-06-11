import {
  USER_ALL,
  USER_GET,
  USER_DEL,
  USER_POST,
  USER_CREATE,
  USER_LOADING,
  USER_ERROR,
  USER_PUT,
} from '../types';

import api from '../../../utils/functions/api';

export const userCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/user/create/`,
      payload,
    );
    dispatch({ type: USER_CREATE, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: USER_ERROR });
    throw new Error(error);
  }
};

export const userAll = (params) => async (dispatch) => {
  try {
    const { name = '', size = 5, page = 1 } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/user?name=${name}&size=${size}&page=${page}`,
    );
    if (status === 200) {
      dispatch({ type: USER_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: USER_ERROR });
    throw new Error(error);
  }
};

export const userGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/user/${id}`,
    );
    if (status === 200) {
      dispatch({ type: USER_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: USER_ERROR });
    throw new Error(error);
  }
};

export const userPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/user/${id}`,
      payload,
    );
    dispatch({ type: USER_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: USER_ERROR });
    throw new Error(error);
  }
};
export const userDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/user/${id}`,
    );
    dispatch({ type: USER_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: USER_ERROR });
    throw new Error(error);
  }
};

export const userRegister = (payload) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/user/register/`,
      payload,
    );
    dispatch({ type: USER_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: USER_ERROR });
    throw new Error(error);
  }
};
