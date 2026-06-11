import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';

import { Dashboard, Profile2 } from '../views/Monitor';
import { HomeNavbar } from '../components/Nevbars';
import { MainFooter } from '../components/Footers';
import { MainSidebar } from '../components/Sidebar';
import { NotFound } from '../components/Error';
// import accessRight from '../utils/functions/accessRight';
import * as actions from '../redux/actions';
import { PersonalProfile } from '../views/Profile';
import Loading from 'components/Loading';

export function Monitor() {
  const module = 'MONITOR';
  const prefix = '/monitor';
  const name = 'ศูนย์วิจัยระบบอัตโนมัติอัจฉริยะ';
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
              <Dashboard title="แดชบอร์ด" subtitle={name} />
            </Route>

            <Route exact path={`${prefix}/dashboard`}>
              <Dashboard title="แดชบอร์ด" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/dashboard2`}>
              <Profile2 title="แดชบอร์ด" subtitle={name} />
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

export default Monitor;
