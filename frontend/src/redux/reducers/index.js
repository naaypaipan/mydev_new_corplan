import { combineReducers } from 'redux';

// Common
import UserReducers from './common/UserReducers';
import MeReducers from './common/MeReducers';
// feature
import RoleTypesReducer from './features/RoleTypesReducer';
import EmployeeReducer from './features/EmployeeReducer';
import ProjectReducer from './features/ProjectReducer';
import BudgetReducer from './features/BudgetReducer';
import ExpensesReducer from './features/ExpensesReducer';
import InfoReducers from './features/InfoReducers';
import NotifyReducer from './features/NotifyReducer';
import CustomerReducer from './features/CustomerReducer';
import CustomerTypeReducer from './features/CustomerTypeReducer';
import DepartmentReducer from './features/DepartmentReducer';
import TimestampReducer from './features/TimestampReducer';
import HolidayReducer from './features/HolidayReducer';
import BillingReducer from './features/BillingReducer';
import PayoutReducer from './features/PayoutReducer';
import PayinReducer from './features/PayinReducer';
import PaymentReducer from './features/PaymentReducer';
import PaytypeReducer from './features/PaytypeReducer';
import TransectionTypeReducer from './features/TransectionTypeReducer';
import SalaryReducer from './features/SalaryReducer';
import SalaryListReducer from './features/SalaryListReducer';
import OtRequestReducer from './features/OtRequestReducer';
import OtRequestOrderReducer from './features/OtRequestOrderReducer';
import ChatExpensesReducer from './features/ChatExpensesReducer';
import ManpowerReducer from './features/ManpowerReducer';

const rootRuducer = combineReducers({
  me: MeReducers,
  user: UserReducers,
  roletype: RoleTypesReducer,
  employee: EmployeeReducer,
  project: ProjectReducer,
  budget: BudgetReducer,
  expenses: ExpensesReducer,
  notify: NotifyReducer,
  info: InfoReducers,
  customer: CustomerReducer,
  customerType: CustomerTypeReducer,
  department: DepartmentReducer,
  timestamp: TimestampReducer,
  holiday: HolidayReducer,
  billing: BillingReducer,
  payout: PayoutReducer,
  payin: PayinReducer,
  payments: PaymentReducer,
  paytypes: PaytypeReducer,
  transectionTypes: TransectionTypeReducer,
  salary: SalaryReducer,
  salaryList: SalaryListReducer,
  otRequest: OtRequestReducer,
  otRequestOrder: OtRequestOrderReducer,
  chatExpenses: ChatExpensesReducer,
  manpower: ManpowerReducer,
});
export default rootRuducer;
