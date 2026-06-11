import {
  SALARYLIST_ALL,
  SALARYLIST_GET,
  SALARYLIST_PUT,
  SALARYLIST_DEL,
  SALARYLIST_POST,
  SALARYLIST_RESET,
  SALARYLIST_LOADING,
  SALARYLIST_ERROR,
} from '../../actions/types';

const initialState = {
  salaryList: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case SALARYLIST_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case SALARYLIST_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case SALARYLIST_POST:
      return { isLoading: false, isCompleted: true };
    case SALARYLIST_PUT:
      return { isLoading: false, isCompleted: true };
    case SALARYLIST_DEL:
      return { isLoading: false, isCompleted: true };
    case SALARYLIST_RESET:
      return { SALARYLIST: null, isLoading: true, isCompleted: true };
    case SALARYLIST_LOADING:
      return { isLoading: true, isCompleted: true };
    case SALARYLIST_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
