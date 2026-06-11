import {
  PAYOUT_ALL,
  PAYOUT_GET,
  PAYOUT_DEL,
  PAYOUT_PUT,
  PAYOUT_POST,
  PAYOUT_LOADING,
  PAYOUT_ERROR,
  PAYOUT_RESET,
} from '../../actions/types';

const initialState = {
  payout: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case PAYOUT_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PAYOUT_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PAYOUT_POST:
      return { isLoading: false, isCompleted: true };
    case PAYOUT_PUT:
      return { isLoading: false, isCompleted: true };
    case PAYOUT_DEL:
      return { isLoading: false, isCompleted: true };
    case PAYOUT_RESET:
      return { PAYOUT: null, isLoading: true, isCompleted: true };
    case PAYOUT_LOADING:
      return { isLoading: true, isCompleted: true };
    case PAYOUT_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
