import {
  PAYMENT_ALL,
  PAYMENT_GET,
  PAYMENT_DEL,
  PAYMENT_PUT,
  PAYMENT_POST,
  PAYMENT_LOADING,
  PAYMENT_ERROR,
  PAYMENT_RESET,
} from '../../actions/types';

const initialState = {
  payments: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case PAYMENT_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PAYMENT_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PAYMENT_POST:
      return { isLoading: false, isCompleted: true };
    case PAYMENT_PUT:
      return { isLoading: false, isCompleted: true };
    case PAYMENT_DEL:
      return { isLoading: false, isCompleted: true };
    case PAYMENT_RESET:
      return { PAYMENT: null, isLoading: true, isCompleted: true };
    case PAYMENT_LOADING:
      return { isLoading: true, isCompleted: true };
    case PAYMENT_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
