import {
  CUSTOMER_ALL,
  CUSTOMER_GET,
  CUSTOMER_PUT,
  CUSTOMER_DEL,
  CUSTOMER_POST,
  CUSTOMER_RESET,
  CUSTOMER_LOADING,
  CUSTOMER_ERROR,
} from '../../actions/types';

const initialState = {
  customer: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case CUSTOMER_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case CUSTOMER_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case CUSTOMER_POST:
      return { isLoading: false, isCompleted: true };
    case CUSTOMER_PUT:
      return { isLoading: false, isCompleted: true };
    case CUSTOMER_DEL:
      return { isLoading: false, isCompleted: true };
    case CUSTOMER_RESET:
      return { customer: null, isLoading: true, isCompleted: true };
    case CUSTOMER_LOADING:
      return { isLoading: true, isCompleted: true };
    case CUSTOMER_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
