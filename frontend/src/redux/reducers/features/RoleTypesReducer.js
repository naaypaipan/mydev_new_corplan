import {
  ROLETYPES_ALL,
  ROLETYPES_GET,
  ROLETYPES_DEL,
  ROLETYPES_PUT,
  ROLETYPES_POST,
  ROLETYPES_LOADING,
  ROLETYPES_ERROR,
} from '../../actions/types';

const initialState = {
  roletype: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case ROLETYPES_LOADING:
      return { isLoading: true, isCompleted: true };
    case ROLETYPES_ERROR:
      return { isLoading: false, isCompleted: false, ...action.payload };
    case ROLETYPES_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case ROLETYPES_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case ROLETYPES_POST:
      return { isLoading: false, isCompleted: true };
    case ROLETYPES_PUT:
      return { isLoading: false, isCompleted: true };
    case ROLETYPES_DEL:
      return { isLoading: false, isCompleted: true };
    default:
      return state;
  }
}
