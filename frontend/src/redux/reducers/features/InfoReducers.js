import {
  INFO_GET,
  INFO_CREATE,
  INFO_PUT,
  INFO_RESET,
  INFO_LOADING,
  INFO_ERROR,
} from '../../actions/types';

const initialState = {
  roomtypes: null,
  isLoading: true,
  isCompleted: false,
};
export default function (state = initialState, action) {
  switch (action.type) {
    case INFO_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case INFO_CREATE:
      return { isLoading: true, isCompleted: true };
    case INFO_PUT:
      return { isLoading: false, isCompleted: true };
    case INFO_RESET:
      return { isLoading: true, isCompleted: true };
    case INFO_LOADING:
      return { isLoading: true, isCompleted: true };
    case INFO_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
