import {
  PROJECT_ALL,
  PROJECT_GET,
  PROJECT_DEL,
  PROJECT_PUT,
  PROJECT_POST,
  PROJECT_LOADING,
  PROJECT_ERROR,
  PROJECT_RESET,
} from '../../actions/types';

const initialState = {
  budget: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case PROJECT_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PROJECT_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case PROJECT_POST:
      return { isLoading: false, isCompleted: true };
    case PROJECT_PUT:
      return { isLoading: false, isCompleted: true };
    case PROJECT_DEL:
      return { isLoading: false, isCompleted: true };
    case PROJECT_RESET:
      return { PROJECT: null, isLoading: true, isCompleted: true };
    case PROJECT_LOADING:
      return { isLoading: true, isCompleted: true };
    case PROJECT_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
