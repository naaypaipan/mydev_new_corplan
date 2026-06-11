import {
  PAYTYPE_ALL,
  PAYTYPE_GET,
  PAYTYPE_DEL,
  PAYTYPE_PUT,
  PAYTYPE_POST,
  PAYTYPE_LOADING,
  PAYTYPE_ERROR,
  PAYTYPE_RESET,
} from '../../actions/types';

const initialState = {
  paytypes: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case PAYTYPE_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PAYTYPE_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PAYTYPE_POST:
      return { isLoading: false, isCompleted: true };
    case PAYTYPE_PUT:
      return { isLoading: false, isCompleted: true };
    case PAYTYPE_DEL:
      return { isLoading: false, isCompleted: true };
    case PAYTYPE_RESET:
      return { PAYTYPE: null, isLoading: true, isCompleted: true };
    case PAYTYPE_LOADING:
      return { isLoading: true, isCompleted: true };
    case PAYTYPE_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
