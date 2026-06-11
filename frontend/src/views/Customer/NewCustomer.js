import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Card, Button } from '@mui/material';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';

import { BackButton } from '../../components/Button';
import { CustomerForm } from '../../components/Forms';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { useHistory } from 'react-router';

export default function NewCustomer({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const customerType = useSelector((state) => state.customerType);

  const [bank, setBank] = useState();
  const [customer_status, setCustomer_status] = useState(true);
  const [supplier_status, setSupplier_status] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    control,
    setValue,
  } = useForm({});



  const onSubmit = async (data) => {
    try {
      // console.log('data', data);
      const dataSubmit = {
        ...data,
        bank: {
          bank_name: bank,
          account_name: data?.bank?.account_name,
          account_number: data?.bank?.account_number,
        },
      };
      await dispatch(actions.customerCreate(dataSubmit));
      await dispatch(actions.customerAll());
      alert('สำเร็จ');
      history.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  if (!customerType.isLoading && customerType.isCompleted) {
    return (
      <div>
        <div className="flex flex-row justify-start pb-4">
          <div>
            <BackButton />
          </div>
        </div>
        <div>
          <Card className="p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <CustomerForm
                errors={errors}
                customerType={customerType}
                control={control}
                Controller={Controller}
                setValue={setValue}
                bank={bank}
                setBank={setBank}
                customer_status={customer_status}
                setCustomer_status={setCustomer_status}
                supplier_status={supplier_status}
                setSupplier_status={setSupplier_status}
              />
              <div className="flex flex-row justify-end gap-1 py-4">
                <Button variant="contained" type="submit">
                  บันทึก
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }
  return <Error />;
}
NewCustomer.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

NewCustomer.defaultProps = {
  title: '',
  subtitle: '',
};
