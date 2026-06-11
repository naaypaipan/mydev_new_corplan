import {
  PAYIN_ALL,
  PAYIN_GET,
  PAYIN_DEL,
  PAYIN_PUT,
  PAYIN_POST,
  PAYIN_LOADING,
  PAYIN_ERROR,
  PAYIN_RESET,
} from '../../actions/types';

const initialState = {
  payin: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case PAYIN_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PAYIN_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PAYIN_POST:
      return { isLoading: false, isCompleted: true };
    case PAYIN_PUT:
      return { isLoading: false, isCompleted: true };
    case PAYIN_DEL:
      return { isLoading: false, isCompleted: true };
    case PAYIN_RESET:
      return { PAYIN: null, isLoading: true, isCompleted: true };
    case PAYIN_LOADING:
      return { isLoading: true, isCompleted: true };
    case PAYIN_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
