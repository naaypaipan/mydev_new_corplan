import {
  TIMESTAMP_ALL,
  TIMESTAMP_GET,
  TIMESTAMP_DEL,
  TIMESTAMP_PUT,
  TIMESTAMP_POST,
  TIMESTAMP_LOADING,
  TIMESTAMP_ERROR,
  TIMESTAMP_RESET,
} from '../../actions/types';

const initialState = {
  timestamp: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case TIMESTAMP_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case TIMESTAMP_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case TIMESTAMP_POST:
      return { isLoading: false, isCompleted: true };
    case TIMESTAMP_PUT:
      return { isLoading: false, isCompleted: true };
    case TIMESTAMP_DEL:
      return { isLoading: false, isCompleted: true };
    case TIMESTAMP_RESET:
      return { TIMESTAMP: null, isLoading: true, isCompleted: true };
    case TIMESTAMP_LOADING:
      return { isLoading: true, isCompleted: true };
    case TIMESTAMP_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
