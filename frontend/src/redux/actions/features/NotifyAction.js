import {
  NOTIFY_REQ_TOKEN,
  NOTIFY_DEPARTMENT,
  NOTIFY_DIRECT,
  NOTIFY_LOADING,
  NOTIFY_ERROR,
} from '../types';

import api from '../../../utils/functions/api';

export const requestNotifyToken = (payload) => async (dispatch) => {
  try {
    dispatch({ type: NOTIFY_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/notify/token`,
      {
        ...payload,
      },
    );
    dispatch({ type: NOTIFY_REQ_TOKEN, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: NOTIFY_ERROR });
    throw new Error(error);
  }
};

export const requestNotifyCheckinDaily = (payload) => async (dispatch) => {
  try {
    dispatch({ type: NOTIFY_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/notify/auto`,
      {
        ...payload,
      },
    );
    dispatch({ type: NOTIFY_REQ_TOKEN, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: NOTIFY_ERROR });
    throw new Error(error);
  }
};

export const requestNotifyTokenTimestamp = (payload) => async (dispatch) => {
  try {
    console.log('payload action', payload);

    dispatch({ type: NOTIFY_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/notify/token-timestamp`,
      {
        ...payload,
      },
    );
    dispatch({ type: NOTIFY_REQ_TOKEN, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: NOTIFY_ERROR });
    throw new Error(error);
  }
};

/**
 * @typedef {Object} DirectNotifyPayload
 * @property {string} employeeId ไอดีของพนักงาน ใช้ได้จาก me?.userData?._id
 * @property {string} message ข้อความที่ต้องการให้แจ้งเตืิอน
 *
 * @function notifyDirect ส่งการแจ้งเตือนคนใดคนหนึ่ง
 * @param {DirectNotifyPayload} payload ข้อมูลที่่ส่งมาสำหรับการแจ้งเตือน
 */
export const notifyDirect = (payload) => async (dispatch) => {
  try {
    dispatch({ type: NOTIFY_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/notify/direct`,
      {
        ...payload,
      },
    );
    dispatch({ type: NOTIFY_DIRECT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: NOTIFY_ERROR });
    throw new Error(error);
  }
};

/**
 * @typedef {Object} DepartmentNotifyPayload
 * @property {string} departmentId ไอดีของแผนก
 * @property {string} message ข้อความที่ต้องการให้แจ้งเตืิอน
 *
 * @function notifyOverDepartment ส่งการแจ้งเตือนไปทั้งแผนก
 * @param {DepartmentNotifyPayload} payload ข้อมูลที่่ส่งมาสำหรับการแจ้งเตือน
 */
export const notifyOverDepartment = (payload) => async (dispatch) => {
  try {
    dispatch({ type: NOTIFY_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/notify/department`,
      {
        ...payload,
      },
    );
    dispatch({ type: NOTIFY_DEPARTMENT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: NOTIFY_ERROR });
    throw new Error(error);
  }
};
