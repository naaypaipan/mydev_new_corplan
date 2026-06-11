import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';

//view

import {
  PersonalProfile,
  PersonalExpenses,
  Calendar,
  Timestamp,
  CheckIn,
  CheckOut,
  EditExpenses,
  AddOtRequest,
  OvertimeRequestList,
  AddOt,
  ExpensesDetail,
} from '../views/Profile';
//

import { HomeNavbar } from '../components/Nevbars';
import { MainFooter } from '../components/Footers';
import { MainSidebar } from '../components/Sidebar';
import { NotFound } from '../components/Error';
// import accessRight from '../utils/functions/accessRight';
import * as actions from '../redux/actions';
import Loading from 'components/Loading';

export function Profile() {
  const module = 'PROFILE';
  const prefix = '/profile';
  const name = 'ข้อมูลส่วนตัว';
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

      <div className="relative lg:ml-80  min-h-screen  pt-2 lg:px-8 px-4 ">
        <div className="py-4">
          <Switch>
            {' '}
            <Route exact path={`${prefix}/`}>
              <Calendar title="ปฏิทิน" subtitle={name} />
            </Route>{' '}
            <Route exact path={`${prefix}/ot`}>
              <OvertimeRequestList title="คำขอโอที" subtitle={name} />
            </Route>{' '}
            <Route exact path={`${prefix}/ot/add`}>
              <AddOt title="เพิ่ม" subtitle={name} />
            </Route>{' '}
            <Route exact path={`${prefix}/timestamp`}>
              <Timestamp title="บันทึกเวลา" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/timestamp/Check-In`}>
              <CheckIn title="เข้างาน" subtitle={name} />
            </Route>{' '}
            <Route exact path={`${prefix}/timestamp/Check-out/:id`}>
              <CheckOut title="ออกงาน" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/timestamp/ot/add/:id`}>
              <AddOtRequest title="คำขอโอที" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/profile`}>
              <PersonalProfile title="โปรไฟล์" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/disbursement`}>
              <PersonalExpenses title="การเบิกจ่าย" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/disbursement/edit/:id`}>
              <EditExpenses title="แก้ไข" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/disbursement/detail/:id`}>
              <ExpensesDetail title="รายละเอียด" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/calendar`}>
              <Calendar title="CALENDAR" subtitle={name} />
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

export default Profile;
