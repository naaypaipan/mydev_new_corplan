import {
  CHATEXPENSES_ALL,
  CHATEXPENSES_GET,
  CHATEXPENSES_PUT,
  CHATEXPENSES_DEL,
  CHATEXPENSES_POST,
  CHATEXPENSES_RESET,
  CHATEXPENSES_LOADING,
  CHATEXPENSES_ERROR,
} from '../../actions/types';

const initialState = {
  chatExpenses: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case CHATEXPENSES_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case CHATEXPENSES_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case CHATEXPENSES_POST:
      return { isLoading: false, isCompleted: true };
    case CHATEXPENSES_PUT:
      return { isLoading: false, isCompleted: true };
    case CHATEXPENSES_DEL:
      return { isLoading: false, isCompleted: true };
    case CHATEXPENSES_RESET:
      return { CHATEXPENSES: null, isLoading: true, isCompleted: true };
    case CHATEXPENSES_LOADING:
      return { isLoading: true, isCompleted: true };
    case CHATEXPENSES_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
