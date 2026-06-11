import {
  DEPARTMENT_ALL,
  DEPARTMENT_GET,
  DEPARTMENT_DEL,
  DEPARTMENT_PUT,
  DEPARTMENT_POST,
  DEPARTMENT_LOADING,
  DEPARTMENT_ERROR,
} from '../../actions/types';

const initialState = {
  department: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case DEPARTMENT_LOADING:
      return { isLoading: true, isCompleted: true };
    case DEPARTMENT_ERROR:
      return { isLoading: false, isCompleted: false, ...action.payload };
    case DEPARTMENT_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case DEPARTMENT_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case DEPARTMENT_POST:
      return { isLoading: false, isCompleted: true };
    case DEPARTMENT_PUT:
      return { isLoading: false, isCompleted: true };
    case DEPARTMENT_DEL:
      return { isLoading: false, isCompleted: true };
    default:
      return state;
  }
}
