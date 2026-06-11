import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';

//view

import {

  QuotationDetail,
  InvoiceDetail,
  CreateFormInvoice,
  ReceiptDetail,
  CreateFormReceipt,
  CreateFormBillingNotes,
  BillingNotesDetail,
  EditQuotation,
  EditInvoice,
  EditReceipt,
  EditBillingNotes,
  ContactForm,
  QuotationView,
  ContactFormPage,
} from '../views/Sale';
//

import { HomeNavbar } from '../components/Nevbars';
import { MainFooter } from '../components/Footers';
import { MainSidebar } from '../components/Sidebar';
import { NotFound } from '../components/Error';
// import accessRight from '../utils/functions/accessRight';
import * as actions from '../redux/actions';
import Loading from 'components/Loading';
import CreateFormQuotation from 'views/Sale/CreateFormQuotation';

export function Sale() {
  const module = 'SALE';
  const prefix = '/sale';
  const name = 'SALE';
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

    return () => { };
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
            <Route exact path={`${prefix}/quotation`}>
              <QuotationDetail title="Quatation" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/quotation/create`}>
              <CreateFormQuotation title="Create Quotation" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/quotation/contact/new`}>
              <ContactForm title="add contact" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/quotation/contactlist`}>
              <ContactFormPage title="add contact" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/quotation/detail/:id`}>
              <QuotationView title="View Details" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/quotation/edit/:id`}>
              <EditQuotation title="Edit" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/invoice`}>
              <InvoiceDetail title="Invoice" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/invoice/create`}>
              <CreateFormInvoice title="Create Invoice" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/invoice/edit/:id`}>
              <EditInvoice title="Edit" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/receipt`}>
              <ReceiptDetail title="Receipt" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/receipt/create`}>
              <CreateFormReceipt title="Create Receipt" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/receipt/edit/:id`}>
              <EditReceipt title="Edit" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/billingnotes`}>
              <BillingNotesDetail title="Billing Notes" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/billingnotes/create`}>
              <CreateFormBillingNotes title="Create Billing Notes" subtitle={name} />
            </Route>
            <Route exact path={`${prefix}/billingnotes/edit/:id`}>
              <EditBillingNotes title="Edit Billing Notes" subtitle={name} />
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
export default Sale;
