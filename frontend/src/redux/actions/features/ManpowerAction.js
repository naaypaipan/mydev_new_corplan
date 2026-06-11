import { MANPOWER_ALL, MANPOWER_ERROR, MANPOWER_RESET } from '../types';

import api from '../../../utils/functions/api';

export const manpowerAll = (params) => async (dispatch) => {
  try {
    const {
      firstname = '',
      lastname = '',
      taxId = '',
      name = '',
      size = 200,
      page = 1,
      bill = '',
      profile,
    } = params;
    const q = new URLSearchParams({ name, firstname, lastname, taxId, size, page, bill });
    if (profile) q.set('profile', profile);
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/manpower?${q.toString()}`,
    );
    if (status === 200) {
      dispatch({ type: MANPOWER_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: MANPOWER_ERROR });
    throw error;
  }
};
export const manpowerReset = () => async (dispatch) => {
  try {
    dispatch({ type: MANPOWER_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: MANPOWER_ERROR });
    throw new Error(error);
  }
};
