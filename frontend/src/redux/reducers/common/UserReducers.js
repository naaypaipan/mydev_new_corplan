import {
  USER_ALL,
  USER_GET,
  USER_PUT,
  USER_DEL,
  USER_POST,
  USER_CREATE,
  USER_LOADING,
  USER_ERROR,
} from '../../actions/types';

const initialState = {
  user: null,
  isLoading: false,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case USER_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case USER_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case USER_POST:
      return { isLoading: false, isCompleted: true };
    case USER_CREATE:
      return { isLoading: false, isCompleted: true };
    case USER_PUT:
      return { isLoading: false, isCompleted: true };
    case USER_DEL:
      return { isLoading: false, isCompleted: true };
    case USER_LOADING:
      return { isLoading: true, isCompleted: true };
    case USER_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
