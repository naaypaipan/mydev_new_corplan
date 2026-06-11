import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '@mui/material';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

import addressToString from '../../utils/functions/addressToString';

export default function DetailCustomer({ title, subtitle }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const customer = useSelector((state) => state.customer);

  useEffect(() => {
    dispatch(actions.customerGet(id));
    dispatch(actions.customerTypeAll());
    return () => {};
  }, []);



  const renderDetail = () => (
    <div className="flex flex-wrap divide-y">
      <div className="w-full py-4 text-lg font-semibold ">{'รายละเอียด'}</div>
      <div className="w-1/2 py-4 px-2 font-semibold ">{'ชื่อ-สกุล'}</div>
      <div className="w-1/2 py-4 ">{`${customer.firstname} ${customer.lastname}`}</div>
      <div className="w-1/2 py-4 px-2 font-semibold ">{'เบอร์โทรศัพท์'}</div>
      <div className="w-1/2 py-4 ">{`${customer.telephone}`}</div>
      <div className="w-1/2 py-4 px-2 font-semibold ">{'ที่อยู่'}</div>
      <div className="w-1/2 py-4 ">{`${addressToString(
        customer.address,
      )}`}</div>
      <div className="w-full"></div>
    </div>
  );

  if (customer.isLoading || customer.rows) {
    return <Loading />;
  }
  if (!customer.isLoading && customer.isCompleted) {
    return (
      <div>
        <div className="flex flex-row justify-start pb-4">
          <div>
            <BackButton />
          </div>
        </div>
        <div>
          <Card className="p-4 ">{renderDetail()}</Card>
        </div>
      </div>
    );
  }
  return <Error />;
}
DetailCustomer.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

DetailCustomer.defaultProps = {
  title: '',
  subtitle: '',
};
