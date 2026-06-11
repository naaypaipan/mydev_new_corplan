/* eslint-disable no-underscore-dangle */
/* eslint-disable no-alert */
/* eslint-disable no-console */
import api from './api';
import { setStorage, removeStorage } from './localstorage';

// eslint-disable-next-line import/prefer-default-export
export const authMethods = {
  signup: async (username, password, email, firstname = '', lastname = '') => {
    api
      .post(`${process.env.REACT_APP_API_URL}/user/register`, {
        username,
        email,
        password,
        firstname,
        lastname,
      })
      .then(async (res) => {
        const remember = res?.data?.userData;
        const token = res.data?.accessToken;
        await setStorage('token', token);
        await setStorage('remember', JSON.stringify(remember));
        console.log('signup success');
      })
      .catch((error) => {
        window.alert(error);
      });
  },
  signin: async (username, password) => {
    try {
      const res = await api.post(
        `${process.env.REACT_APP_API_URL}/user/login`,
        {
          username,
          password,
        },
      );
      const { userData: data = {} } = res?.data;
      const remember = {
        id: data?._id,
        uid: data?.uid,
        firstname: data?.firstname,
        lastname: data?.lastname,
        department: {
          name: data?.department?.name,
          description: data?.department?.description,
        },
      };

      const token = res?.data?.accessToken;
      console.log('token setting');
      await setStorage('token', token);
      await setStorage('remember', JSON.stringify(remember));
      return res.data;
    } catch (e) {
      throw new Error(e);
    }
  },
  signout: async () => {
    removeStorage('token');
    removeStorage('remember');
  },
};
