import {
  TRANSECTIONTYPE_ALL,
  TRANSECTIONTYPE_GET,
  TRANSECTIONTYPE_DEL,
  TRANSECTIONTYPE_PUT,
  TRANSECTIONTYPE_POST,
  TRANSECTIONTYPE_LOADING,
  TRANSECTIONTYPE_ERROR,
  TRANSECTIONTYPE_RESET,
} from '../../actions/types';

const initialState = {
  transectiontypes: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case TRANSECTIONTYPE_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case TRANSECTIONTYPE_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case TRANSECTIONTYPE_POST:
      return { isLoading: false, isCompleted: true };
    case TRANSECTIONTYPE_PUT:
      return { isLoading: false, isCompleted: true };
    case TRANSECTIONTYPE_DEL:
      return { isLoading: false, isCompleted: true };
    case TRANSECTIONTYPE_RESET:
      return { TRANSECTIONTYPE: null, isLoading: true, isCompleted: true };
    case TRANSECTIONTYPE_LOADING:
      return { isLoading: true, isCompleted: true };
    case TRANSECTIONTYPE_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
