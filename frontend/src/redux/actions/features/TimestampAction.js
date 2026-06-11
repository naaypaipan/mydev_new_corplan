import {
  TIMESTAMP_ALL,
  TIMESTAMP_GET,
  TIMESTAMP_DEL,
  TIMESTAMP_PUT,
  TIMESTAMP_POST,
  TIMESTAMP_LOADING,
  TIMESTAMP_ERROR,
  TIMESTAMP_RESET,
} from '../types';

import api from '../../../utils/functions/api';

export const timestampHrCheckin = (payload) => async (dispatch) => {
  try {
    dispatch({ type: TIMESTAMP_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/timestamp/with-hr`,
      payload,
    );
    dispatch({ type: TIMESTAMP_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampCreate = (payload) => async (dispatch) => {
  try {
    dispatch({ type: TIMESTAMP_LOADING });
    const { data } = await api.post(
      `${process.env.REACT_APP_API_URL}/timestamp`,
      payload,
    );
    dispatch({ type: TIMESTAMP_POST, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampAll = (params) => async (dispatch) => {
  try {
    const {
      name = '',
      size = 999999,
      page = 1,
      me = '',
      project_id = '',
      emSelect = { _id: '' },
      ot = '',
      dateStart = '',
      dateEnd = '',
      cal = '',
      sort = '',
      dash = '',
      roleSelect = { _id: '' },
      profile = '',
      typeSelect = '',
      employeekey = '',
    } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/timestamp?name=${name}&size=${size}&page=${page}&me=${me}&project_id=${project_id}&em=${emSelect?._id}&ot=${ot}&dateStart=${dateStart}&dateEnd=${dateEnd}&cal=${cal}&sort=${sort}&role=${roleSelect?._id}&dash=${dash}&profile=${profile}&type=${typeSelect}&employeekey=${employeekey}`,
    );
    if (status === 200) {
      dispatch({ type: TIMESTAMP_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampManpower = (params) => async (dispatch) => {
  try {
    const {
      name = '',
      size = 999999,
      page = 1,
      me = '',
      project_id = '',
      emSelect = { _id: '' },
      ot = '',
      dateStart = '',
      dateEnd = '',
      cal = '',
      sort = '',
      dash = '',
      roleSelect = { _id: '' },
      profile = '',
      typeSelect = '',
      employeekey = '',
    } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/timestamp/manppower/check?name=${name}&size=${size}&page=${page}&me=${me}&project_id=${project_id}&em=${emSelect?._id}&ot=${ot}&dateStart=${dateStart}&dateEnd=${dateEnd}&cal=${cal}&sort=${sort}&role=${roleSelect?._id}&dash=${dash}&profile=${profile}&type=${typeSelect}&employeekey=${employeekey}`,
    );
    if (status === 200) {
      dispatch({ type: TIMESTAMP_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampDaily = (params) => async (dispatch) => {
  try {
    const {
      me = '',
      project_id = '',
      dateStart = '',
      dateEnd = '',
      typeSelect = '',
    } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/timestamp/daily?me=${me}&project_id=${project_id}&dateStart=${dateStart}&dateEnd=${dateEnd}&typeSelect=${typeSelect}`,
    );
    if (status === 200) {
      dispatch({ type: TIMESTAMP_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampDashboard = (params) => async (dispatch) => {
  try {
    const { me = '', project_id = '', dateStart = '', dateEnd = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/timestamp/dashboard?me=${me}&project_id=${project_id}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
    );
    if (status === 200) {
      dispatch({ type: TIMESTAMP_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampPayrollDashboard = (params) => async (dispatch) => {
  try {
    const { dateStart = '', dateEnd = '', typeSelect = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/timestamp/timestamp-payroll-dashboard?dateStart=${dateStart}&dateEnd=${dateEnd}&typeSelect=${typeSelect}`,
    );
    if (status === 200) {
      dispatch({ type: TIMESTAMP_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampPayroll = (params) => async (dispatch) => {
  try {
    const { dateStart = '', dateEnd = '', typeSelect = '' } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/timestamp/timestamp-payroll?dateStart=${dateStart}&dateEnd=${dateEnd}&typeSelect=${typeSelect}`,
    );
    if (status === 200) {
      dispatch({ type: TIMESTAMP_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampCheckin = (params) => async (dispatch) => {
  try {
    const {
      name = '',
      size = 200,
      page = 1,
      me = '',
      project_id = '',
      emSelect = { _id: '' },
      checkoutem = '',
    } = params;
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/timestamp/checkin?name=${name}&size=${size}&page=${page}&me=${me}&project_id=${project_id}&em=${emSelect?._id}&checkoutem=${checkoutem}`,
    );
    if (status === 200) {
      dispatch({ type: TIMESTAMP_ALL, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampGet = (id) => async (dispatch) => {
  try {
    const { data, status } = await api.get(
      `${process.env.REACT_APP_API_URL}/timestamp/${id}`,
    );
    if (status === 200) {
      dispatch({ type: TIMESTAMP_GET, payload: data });
    }
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampPut = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: TIMESTAMP_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/timestamp/${id}`,
      payload,
    );
    dispatch({ type: TIMESTAMP_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};
export const timestampPutSalary = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: TIMESTAMP_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/timestamp/labour/${id}`,
      payload,
    );
    dispatch({ type: TIMESTAMP_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampOtRequire = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: TIMESTAMP_LOADING });
    const { data } = await api.put(
      `${process.env.REACT_APP_API_URL}/timestamp/ot/${id}`,
      payload,
    );
    dispatch({ type: TIMESTAMP_PUT, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};
export const timestampDelete = (id) => async (dispatch) => {
  try {
    dispatch({ type: TIMESTAMP_LOADING });
    const { data } = await api.delete(
      `${process.env.REACT_APP_API_URL}/timestamp/${id}`,
    );
    dispatch({ type: TIMESTAMP_DEL, payload: data });
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};

export const timestampReset = () => async (dispatch) => {
  try {
    dispatch({ type: TIMESTAMP_RESET });
  } catch (error) {
    console.error(error);
    dispatch({ type: TIMESTAMP_ERROR });
    throw new Error(error);
  }
};
