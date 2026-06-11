import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Customers,
  CustomerTypes,
  DetailCustomer,
  EditCustomer,
  EditCustomerType,
  NewCustomer,
} from '../views/Customer';
import { HomeNavbar } from '../components/Nevbars';
import { MainFooter } from '../components/Footers';
import { MainSidebar } from '../components/Sidebar';
import * as actions from '../redux/actions';
import { Loading } from '../components/Loading';
import { NotFound } from '../components/Error';
import { accessRightSubMenu } from '../utils/functions/accessRight';

export function Customer() {
  const module = 'CUSTOMER';
  const prefix = '/Customer';
  const name = 'ลูกค้าสัมพันธ์';
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
    console.log('Layout : Customer');

    dispatch(actions.meGet());
    // dispatch(actions.());

    return () => {};
  }, []);

  if (!me.userData) {
    return <Loading />;
  }
  // if (accessRight(me, module)) {
  return (
    <div className="min-h-screen">
      <MainSidebar
        onMobileClose={handleOnMobileNavClose}
        openMobile={isMobileNavOpen}
        me={me}
      />
      <HomeNavbar onMobileNavOpen={handleOnMobileNavOpen} />
      <div className="lg:ml-80  min-h-screen  pt-2 px-8 ">
        <div className="py-4">
          <Switch>
            <Redirect exact from={`${prefix}`} to={`${prefix}/customers`} />
            <Redirect from="/:url*(/+)" to={pathname.slice(0, -1)} />
            <Route exact path={`${prefix}/customers`}>
              <Customers title={'ลูกค้า'} subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/customers/new`}>
              <NewCustomer title={'เพิ่มลูกค้า'} subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/customer/:id`}>
              <DetailCustomer title={'รายละเอียด'} subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/customer/edit/:id`}>
              <EditCustomer title={'แก้ไข'} subtitle={name} />
            </Route>
            {accessRightSubMenu(me, module, '/customer/customer-types', 1) && (
              <Switch>
                <Route exact path={`${prefix}/customer-types`}>
                  <CustomerTypes title={'ประเภทลูกค้า'} subtitle={name} />
                </Route>
                <Route exact path={`${prefix}/customer-type/edit/:id`}>
                  <EditCustomerType title={'แก้ไข'} subtitle={name} />
                </Route>
                <Route path="*">
                  <NotFound />
                </Route>
              </Switch>
            )}
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
  // }
  // return <></>;
}

export default Customer;
