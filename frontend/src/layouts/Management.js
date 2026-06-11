import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';

import {
  Employee,
  EditEmployee,
  EditRoleType,
  EditUser,
  RoleType,
  Users,
  BusinessProfile,
  NotifyRedirect,
  Notify,
  Departments,
  EditDepartment,
  NotifyTimestampRedirect,
  EditHoliday,
  Holiday,
  EditBusinessProfile,
  PayTypeList,
  TransectionTypeList,
  Developer,
} from '../views/Management';
import { HomeNavbar } from '../components/Nevbars';
import { MainFooter } from '../components/Footers';
import { MainSidebar } from '../components/Sidebar';
import { NotFound } from '../components/Error';
// import accessRight from '../utils/functions/accessRight';
import * as actions from '../redux/actions';
import Loading from 'components/Loading';

export function Management() {
  const module = 'MANAGEMENT';
  const prefix = '/management';
  const name = 'ตั้งค่าระบบ';
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
            <Route exact path={`/`}>
              <Employee title="พนักงาน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/notify/redirect-timestamp`}>
              <NotifyTimestampRedirect title="แจ้งเตือน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/notify/redirect`}>
              <NotifyRedirect title="แจ้งเตือน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/business`}>
              <BusinessProfile title="ธุรกิจ" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/business/edit/:id`}>
              <EditBusinessProfile title="แก้ไข" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/employee`}>
              <Employee title="พนักงาน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/employee/edit/:id`}>
              <EditEmployee title="แก้ไข" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/department`}>
              <Departments title="แผนก" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/department/edit/:id`}>
              <EditDepartment title="แก้ไขแผนก" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/user/`}>
              <Users title="ผู้ใช้งาน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/user/edit/:id`}>
              <EditUser title="แก้ไขผู้ใช้งาน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/role-type/`}>
              <RoleType title="ประเภทบทบาท" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/role-type/edit/:id`}>
              <EditRoleType title="แก้ไขบทบาท" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/notify`}>
              <Notify title="แจ้งเตือน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/holiday`}>
              <Holiday title="วันหยุด" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/holiday/edit/:id`}>
              <EditHoliday title="แก้ไข" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/paytype`}>
              <PayTypeList title="ประเภทการจ่ายเงิน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/transection-type`}>
              <TransectionTypeList title="ประเภทรายการ" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/developer`}>
              <Developer title="นักพัฒนา" subtitle={name} />
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

export default Management;
