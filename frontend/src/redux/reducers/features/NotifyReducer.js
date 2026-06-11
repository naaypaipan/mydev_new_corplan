import {
  NOTIFY_REQ_TOKEN,
  NOTIFY_DEPARTMENT,
  NOTIFY_DIRECT,
  NOTIFY_ERROR,
  NOTIFY_LOADING,
} from '../../actions/types';

const initialState = {
  notify: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function NotifyReducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFY_LOADING:
      return { isLoading: true, isCompleted: true };
    case NOTIFY_ERROR:
      return { isLoading: false, isCompleted: false, ...action.payload };
    case NOTIFY_REQ_TOKEN:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case NOTIFY_DEPARTMENT:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case NOTIFY_DIRECT:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    default:
      return state;
  }
}
