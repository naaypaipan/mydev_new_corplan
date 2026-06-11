import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Login, Register } from '../views/Auth';
import { AuthNavbar } from '../components/Nevbars';
import { AuthFooter, MainFooter } from '../components/Footers';
import { Loading } from '../components/Loading';
import background from '../assets/img/BG-2.webp';

export const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Layout : Auth');
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
          <div
            className="relative top-0 w-full h-full  bg-no-repeat bg-full"
            // style={{
            //   backgroundImage: `url(${background})`,
            // }}
          >
            <Switch>
              {window.localStorage.token ? (
                <Redirect from="/" to="/profile/calendar" />
              ) : (
                <div className="relative  min-h-screen  ">
                  <div className="">
                    <Switch>
                      <Route path="/auth/login" exact component={Login} />
                      <Route
                        path="/auth/login/register"
                        exact
                        component={Register}
                      />
                      <Redirect from="/auth" to="/auth/login" />
                    </Switch>
                  </div>
                </div>
              )}
            </Switch>
            <Switch></Switch>
          </div>
        </section>
        <MainFooter />
      </div>
    );
  }
  return <Loading />;
};

export default Auth;
