import {
  SALARY_ALL,
  SALARY_GET,
  SALARY_PUT,
  SALARY_DEL,
  SALARY_POST,
  SALARY_RESET,
  SALARY_LOADING,
  SALARY_ERROR,
} from '../../actions/types';

const initialState = {
  salary: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case SALARY_ALL:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case SALARY_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case SALARY_POST:
      return { isLoading: false, isCompleted: true };
    case SALARY_PUT:
      return { isLoading: false, isCompleted: true };
    case SALARY_DEL:
      return { isLoading: false, isCompleted: true };
    case SALARY_RESET:
      return { SALARY: null, isLoading: true, isCompleted: true };
    case SALARY_LOADING:
      return { isLoading: true, isCompleted: true };
    case SALARY_ERROR:
      return { isLoading: false, isCompleted: false };
    default:
      return state;
  }
}
