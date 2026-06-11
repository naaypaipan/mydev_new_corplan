import {
  MANPOWER_ALL,
  MANPOWER_GET,
  MANPOWER_RESET,
  MANPOWER_LOADING,
  MANPOWER_ERROR,
} from '../../actions/types';

const initialState = {
  manpower: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case MANPOWER_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case MANPOWER_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };

    case MANPOWER_RESET:
      return { MANPOWER: null, isLoading: true, isCompleted: true };
    case MANPOWER_LOADING:
      return { isLoading: true, isCompleted: true };
    case MANPOWER_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
