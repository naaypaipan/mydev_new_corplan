import {
  EMPLOYEE_ALL,
  EMPLOYEE_GET,
  EMPLOYEE_DEL,
  EMPLOYEE_PUT,
  EMPLOYEE_POST,
  EMPLOYEE_LOADING,
  EMPLOYEE_ERROR,
  EMPLOYEE_RESET,
} from '../../actions/types';

const initialState = {
  employee: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case EMPLOYEE_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case EMPLOYEE_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case EMPLOYEE_POST:
      return { isLoading: false, isCompleted: true };
    case EMPLOYEE_PUT:
      return { isLoading: false, isCompleted: true };
    case EMPLOYEE_DEL:
      return { isLoading: false, isCompleted: true };
    case EMPLOYEE_RESET:
      return { employee: null, isLoading: true, isCompleted: true };
    case EMPLOYEE_LOADING:
      return { isLoading: true, isCompleted: true };
    case EMPLOYEE_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
