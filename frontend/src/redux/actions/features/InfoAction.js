import api from '../../../utils/functions/api';

import {
  INFO_GET,
  INFO_PUT,
  INFO_CREATE,
  INFO_LOADING,
  INFO_ERROR,
} from '../types';

// faker.locale = "th"

export const getInformation = () => async (dispatch) => {
  try {
    await api
      .get(`${process.env.REACT_APP_API_URL}/information/`)
      .then((res) => {
        console.log('Request Server to Get information');
        if (res.data) {
          dispatch({ type: INFO_GET, payload: res.data });
        } else {
          dispatch({ type: INFO_GET, payload: null });
        }
      });
  } catch (error) {
    console.error(error);
    dispatch({ type: INFO_ERROR });
    throw new Error(error);
  }
};

export const createOneInformation = (payload) => async (dispatch) => {
  try {
    dispatch({ type: INFO_LOADING });
    await api
      .post(`${process.env.REACT_APP_API_URL}/information/`, payload)
      .then(() => {
        console.log('Request Server to Create New Promotion');
        dispatch({ type: INFO_CREATE });
      });
  } catch (error) {
    console.error(error);
    dispatch({ type: INFO_ERROR });
    throw new Error(error);
  }
};

export const editOneInformation = (id, payload) => async (dispatch) => {
  await api
    .put(`${process.env.REACT_APP_API_URL}/information/${id}`, payload)
    .then(() => {
      console.log('Request Server to edit Promotion');
      dispatch({ type: INFO_PUT });
    });
};
