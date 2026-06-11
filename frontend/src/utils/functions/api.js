import axios from 'axios';
import { getStorage } from './localstorage';

axios.interceptors.request.use(
  (config) => {
    const authToken = getStorage('token');
    // eslint-disable-next-line no-param-reassign
    config.headers.common.Authorization = `Bearer ${authToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export default axios;
