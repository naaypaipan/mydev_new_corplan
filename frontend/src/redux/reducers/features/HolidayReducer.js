import {
  HOLIDAY_ALL,
  HOLIDAY_GET,
  HOLIDAY_DEL,
  HOLIDAY_PUT,
  HOLIDAY_POST,
  HOLIDAY_LOADING,
  HOLIDAY_ERROR,
} from '../../actions/types';

const initialState = {
  holiday: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case HOLIDAY_LOADING:
      return { isLoading: true, isCompleted: true };
    case HOLIDAY_ERROR:
      return { isLoading: false, isCompleted: false, ...action.payload };
    case HOLIDAY_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case HOLIDAY_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case HOLIDAY_POST:
      return { isLoading: false, isCompleted: true };
    case HOLIDAY_PUT:
      return { isLoading: false, isCompleted: true };
    case HOLIDAY_DEL:
      return { isLoading: false, isCompleted: true };
    default:
      return state;
  }
}
