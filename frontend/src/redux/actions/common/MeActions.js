/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
// import api from "../../../config/api"
import {
  removeStorage,
  getStorage,
} from '../../../utils/functions/localstorage';
import { ME_GET, ME_RESET } from '../types';
import api from '../../../utils/functions/api';

export const meGet = () => async (dispatch) => {
  const rememeber = JSON.parse(getStorage('remember'));
  try {
    const { data } = await api.get(
      `${process.env.REACT_APP_API_URL}/user/${rememeber.uid._id}`,
    );
    dispatch({
      type: ME_GET,
      payload: data,
    });
  } catch (error) {
    console.error(error);
    await removeStorage('token');
    await removeStorage('remember');
    alert('โทเค็นหมดอายุ');
    window.location.reload();
    dispatch({ type: ME_RESET });
    throw new Error(error);
  }
};

export const meReset = () => async (dispatch) => {
  dispatch({ type: ME_RESET, payload: null });
};
