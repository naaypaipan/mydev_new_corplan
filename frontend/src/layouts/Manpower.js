import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Login,
  Register,
  ManpowerCheckin,
  ManpowerTimestamp,
  ManpowerCheckout,
  ManpowerCheckTimeStamp,
} from '../views/Auth';
import { AuthNavbar } from '../components/Nevbars';
import { AuthFooter, MainFooter } from '../components/Footers';
import { Loading } from '../components/Loading';
import background from '../assets/img/BG-2.webp';

export const Manpower = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function initSystem() {
      const { data, status } = await axios.post(
        `${process.env.REACT_APP_API_URL}/init-system`,
      );
      console.log('init system : ', data.message);
      if (status === 200) setIsLoading(false);
    }
    initSystem();
    return () => {};
  }, []);

  if (!isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <AuthNavbar />
        <section className="relative w-full h-full  min-h-screen">
          <div className="relative top-0 w-full h-full  bg-no-repeat bg-full">
            <div className="relative  min-h-screen  ">
              <div className="">
                <Switch>
                  <Route
                    path="/manpower/CheckTimeStamp"
                    exact
                    component={ManpowerCheckTimeStamp}
                  />
                  <Route
                    path="/manpower/timestamp/:id"
                    exact
                    component={ManpowerTimestamp}
                  />
                  <Route
                    path="/manpower/timestamp/checkin/:id"
                    exact
                    component={ManpowerCheckin}
                  />
                  <Route
                    path="/manpower/timestamp/checkout/:id"
                    exact
                    component={ManpowerCheckout}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </section>
        <MainFooter />
      </div>
    );
  }
  return <Loading />;
};

export default Manpower;
