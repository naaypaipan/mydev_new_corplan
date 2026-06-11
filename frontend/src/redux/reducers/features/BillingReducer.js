import {
  BILLING_ALL,
  BILLING_GET,
  BILLING_DEL,
  BILLING_PUT,
  BILLING_POST,
  BILLING_LOADING,
  BILLING_ERROR,
  BILLING_RESET,
} from '../../actions/types';

const initialState = {
  billing: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case BILLING_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case BILLING_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case BILLING_POST:
      return { isLoading: false, isCompleted: true };
    case BILLING_PUT:
      return { isLoading: false, isCompleted: true };
    case BILLING_DEL:
      return { isLoading: false, isCompleted: true };
    case BILLING_RESET:
      return { BILLING: null, isLoading: true, isCompleted: true };
    case BILLING_LOADING:
      return { isLoading: true, isCompleted: true };
    case BILLING_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
