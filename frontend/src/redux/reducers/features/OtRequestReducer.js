import {
  OTREQUEST_ALL,
  OTREQUEST_GET,
  OTREQUEST_PUT,
  OTREQUEST_DEL,
  OTREQUEST_POST,
  OTREQUEST_LOADING,
  OTREQUEST_ERROR,
} from '../../actions/types';

const initialState = {
  otRequest: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case OTREQUEST_LOADING:
      return { isLoading: true, isCompleted: true };
    case OTREQUEST_ERROR:
      return { isLoading: false, isCompleted: false, ...action.payload };
    case OTREQUEST_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case OTREQUEST_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case OTREQUEST_POST:
      return { isLoading: false, isCompleted: true };
    case OTREQUEST_PUT:
      return { isLoading: false, isCompleted: true };
    case OTREQUEST_DEL:
      return { isLoading: false, isCompleted: true };
    default:
      return state;
  }
}
