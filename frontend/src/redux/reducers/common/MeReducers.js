import { ME_GET, ME_RESET } from '../../actions/types';

const initialState = {
  userData: null,
  isLoading: true,
  isCompleted: true,
};
// eslint-disable-next-line func-names
export default function (state = initialState, action) {
  switch (action.type) {
    case ME_GET:
      return {
        ...action.payload,
        isLoading: false,
        isCompleted: true,
      };
    case ME_RESET:
      return { isLoading: false, isCompleted: false, ...action.payload };
    default:
      return state;
  }
}
