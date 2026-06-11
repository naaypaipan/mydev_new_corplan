import {
  CUSTOMER_TYPE_ALL,
  CUSTOMER_TYPE_GET,
  CUSTOMER_TYPE_PUT,
  CUSTOMER_TYPE_DEL,
  CUSTOMER_TYPE_POST,
  CUSTOMER_TYPE_LOADING,
  CUSTOMER_TYPE_ERROR,
} from '../../actions/types';

const initialState = {
  customerType: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case CUSTOMER_TYPE_LOADING:
      return { isLoading: true, isCompleted: true };
    case CUSTOMER_TYPE_ERROR:
      return { isLoading: false, isCompleted: false, ...action.payload };
    case CUSTOMER_TYPE_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case CUSTOMER_TYPE_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case CUSTOMER_TYPE_POST:
      return { isLoading: false, isCompleted: true };
    case CUSTOMER_TYPE_PUT:
      return { isLoading: false, isCompleted: true };
    case CUSTOMER_TYPE_DEL:
      return { isLoading: false, isCompleted: true };
    default:
      return state;
  }
}
