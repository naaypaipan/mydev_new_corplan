import {
  PROJECT_ALL,
  PROJECT_GET,
  PROJECT_DEL,
  PROJECT_PUT,
  PROJECT_POST,
  PROJECT_LOADING,
  PROJECT_ERROR,
  PROJECT_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const projectCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: PROJECT_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/project`,
      payload,
    );
    dispatch({ type: PROJECT_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PROJECT_ERROR });
    throw new Error(error);
  }
};

export const projectAll = (params) => async (dispatch) => {
  try {
    const {
      name = '',
      size = 999999,
      page = 1,
      status_deliver = '',
      profile = '',
      time_tracking_enabled = '',
    } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/project?name=${name}&size=${size}&page=${page}&status_deliver=${status_deliver}&profile=${profile}&time_tracking_enabled=${time_tracking_enabled}`,
    );
    if (status === 200) {
      dispatch({ type: PROJECT_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PROJECT_ERROR });
    throw new Error(error);
  }
};

export const projectGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/project/${id}`,
    );
    if (status === 200) {
      dispatch({ type: PROJECT_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: PROJECT_ERROR });
    throw new Error(error);
  }
};

export const projectPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: PROJECT_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/project/${id}`,
      payload,
    );
    dispatch({ type: PROJECT_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PROJECT_ERROR });
    throw new Error(error);
  }
};

export const projectDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: PROJECT_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/project/${id}`,
    );
    dispatch({ type: PROJECT_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: PROJECT_ERROR });
    throw new Error(error);
  }
};

export const projectReset = () => async (dispatch) => {
  try {
    dispatch({ type: PROJECT_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: PROJECT_ERROR });
    throw new Error(error);
  }
};
