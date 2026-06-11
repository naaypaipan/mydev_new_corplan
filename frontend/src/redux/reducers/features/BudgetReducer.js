import {
  BUDGET_ALL,
  BUDGET_GET,
  BUDGET_DEL,
  BUDGET_PUT,
  BUDGET_POST,
  BUDGET_LOADING,
  BUDGET_ERROR,
  BUDGET_RESET,
} from '../../actions/types';

const initialState = {
  budget: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case BUDGET_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case BUDGET_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case BUDGET_POST:
      return { isLoading: false, isCompleted: true };
    case BUDGET_PUT:
      return { isLoading: false, isCompleted: true };
    case BUDGET_DEL:
      return { isLoading: false, isCompleted: true };
    case BUDGET_RESET:
      return { BUDGET: null, isLoading: true, isCompleted: true };
    case BUDGET_LOADING:
      return { isLoading: true, isCompleted: true };
    case BUDGET_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
