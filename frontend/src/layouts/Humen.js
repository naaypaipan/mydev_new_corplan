import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';

//view

import {
  HrTimestampList,
  HrCheckinManagement,
  EditTimestamp,
  OtRequest,
  HrEditEmployee,
  HrEmployee,
  HrReport,
  HrReportDaily,
  HrDashboard,
  HrAddEmployee,
  HrSalaryList,
  HrAddSalary,
  HrSalaryDetail,
  HrEmployeeDetail,
  AddOt,
  EditOt,
} from '../views/Humen';
//

import { HomeNavbar } from '../components/Nevbars';
import { MainFooter } from '../components/Footers';
import { MainSidebar } from '../components/Sidebar';
import { NotFound } from '../components/Error';
// import accessRight from '../utils/functions/accessRight';
import * as actions from '../redux/actions';
import Loading from 'components/Loading';

export function Humen() {
  const module = 'HUMEN';
  const prefix = '/humen';
  const name = 'humen';
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
            <Route exact path={`${prefix}/report`}>
              <HrReport title="รายงานรายเดือน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/reportDaily`}>
              <HrReportDaily title="บันทึกเวลารายวัน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/checkin-management`}>
              <HrCheckinManagement title="จัดการการลงเวลา" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/timestamp`}>
              <HrTimestampList title="รายการบันทึกเวลา" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/timestamp-dashboard`}>
              <HrDashboard title="แดชบอร์ด" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/timestamp/edit/:id`}>
              <EditTimestamp title="แก้ไข" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/ot-request`}>
              <OtRequest title="คำขอโอที" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/ot-request/add`}>
              <AddOt title="เพิ่มโอที" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/ot-request/edit/:id`}>
              <EditOt title="แก้ไขโอที" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/employee`}>
              <HrEmployee title="พนักงาน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/employee/detail/:id`}>
              <HrEmployeeDetail title="รายละเอียดพนักงาน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/salarylist`}>
              <HrSalaryList title="เงินเดือน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/salarylist/detail/:id`}>
              <HrSalaryDetail title="รายละเอียดเงินเดือน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/salarylist/add`}>
              <HrAddSalary title="เพิ่มเงินเดือน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/employee/add`}>
              <HrAddEmployee title="เพิ่มพนักงาน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/employee/edit/:id`}>
              <HrEditEmployee title="แก้ไข" subtitle={name} />
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

export default Humen;
