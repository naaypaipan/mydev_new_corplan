import {
  OTREQUESTORDER_ALL,
  OTREQUESTORDER_GET,
  OTREQUESTORDER_PUT,
  OTREQUESTORDER_DEL,
  OTREQUESTORDER_POST,
  OTREQUESTORDER_LOADING,
  OTREQUESTORDER_ERROR,
} from '../../actions/types';

const initialState = {
  otRequestOrder: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case OTREQUESTORDER_LOADING:
      return { isLoading: true, isCompleted: true };
    case OTREQUESTORDER_ERROR:
      return { isLoading: false, isCompleted: false, ...action.payload };
    case OTREQUESTORDER_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case OTREQUESTORDER_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case OTREQUESTORDER_POST:
      return { isLoading: false, isCompleted: true };
    case OTREQUESTORDER_PUT:
      return { isLoading: false, isCompleted: true };
    case OTREQUESTORDER_DEL:
      return { isLoading: false, isCompleted: true };
    default:
      return state;
  }
}
