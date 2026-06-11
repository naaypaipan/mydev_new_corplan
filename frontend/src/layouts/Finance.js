import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';

//view

import {
  EditExpenses,
  ExpensesList,
  AllExpensesList,
  HrTimestampList,
  BillingList,
  ExpensesDetail,
  BillingDetail,
  Payment,
  NewPayment,
  ExpensesDaily,
  HrExpenseApproverSettings,
} from '../views/Finance';
//

import { HomeNavbar } from '../components/Nevbars';
import { MainFooter } from '../components/Footers';
import { MainSidebar } from '../components/Sidebar';
import { NotFound } from '../components/Error';
// import accessRight from '../utils/functions/accessRight';
import * as actions from '../redux/actions';
import Loading from 'components/Loading';

export function Finance() {
  const module = 'FINANCE';
  const prefix = '/finance';
  const name = 'finance';
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const me = useSelector((state) => state.me);

  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const handleOnMobileNavOpen = () => {
    setMobileNavOpen(true);
  };
  const handleOnMobileNavClose = () => {
    setMobileNavOpen(false);
  };
  useEffect(() => {
    dispatch(actions.meGet());

    return () => {};
  }, []);
  if (!me.userData) {
    return <Loading />;
  }
  return (
    <div className="min-h-screen">
      <MainSidebar
        onMobileClose={handleOnMobileNavClose}
        openMobile={isMobileNavOpen}
        me={me}
      />
      <HomeNavbar onMobileNavOpen={handleOnMobileNavOpen} />

      <div className="relative lg:ml-80  min-h-screen  pt-2 px-8 ">
        <div className="py-4">
          <Switch>
            {' '}
            <Route exact path={`${prefix}/expenses`}>
              <ExpensesList title="รายการเบิกเงิน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/expenses/all`}>
              <AllExpensesList title="รายการตั้งเบิกทั้งหมด" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/expenses/edit/:id`}>
              <EditExpenses title="แก้ไข" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/expenses/detail/:id`}>
              <ExpensesDetail title="รายละเอียด" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/billing`}>
              <BillingList title="วางบิล" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/daily-report`}>
              <ExpensesDaily title="รายงานรายวัน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/Payment`}>
              <Payment title="เตรียมจ่ายเงิน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/Payment/add`}>
              <NewPayment title="เพิ่มการจ่ายเงิน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/billing/detail/:id`}>
              <BillingDetail title="รายละเอียด" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/timestamp`}>
              <HrTimestampList title="บันทึกเวลา" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/expense-approvers`}>
              <HrExpenseApproverSettings
                title="ตั้งค่าผู้อนุมัติรายการเบิกเงิน"
                subtitle={name}
              />
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </div>
      </div>
      <div className="lg:ml-80">
        <MainFooter />
      </div>
    </div>
  );
}

export default Finance;
