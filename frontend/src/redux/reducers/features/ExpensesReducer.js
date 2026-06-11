import {
  EXPENSES_ALL,
  EXPENSES_GET,
  EXPENSES_DEL,
  EXPENSES_PUT,
  EXPENSES_POST,
  EXPENSES_LOADING,
  EXPENSES_ERROR,
  EXPENSES_RESET,
} from '../../actions/types';

const initialState = {
  expenses: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case EXPENSES_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case EXPENSES_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case EXPENSES_POST:
      return { ...state, isLoading: false, isCompleted: true };
    case EXPENSES_PUT:
      return { isLoading: false, isCompleted: true };
    case EXPENSES_DEL:
      return { isLoading: false, isCompleted: true };
    case EXPENSES_RESET:
      return { EXPENSES: null, isLoading: true, isCompleted: true };
    case EXPENSES_LOADING:
      return { isLoading: true, isCompleted: true };
    case EXPENSES_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
