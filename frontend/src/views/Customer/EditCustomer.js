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

export default function EditCustomer({ title, subtitle }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const customerType = useSelector((state) => state.customerType);
  const customer = useSelector((state) => state.customer);
  const [bank, setBank] = useState('');
  const [customer_status, setCustomer_status] = useState(true);
  const [supplier_status, setSupplier_status] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    control,
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    dispatch(actions.customerGet(id));
    dispatch(actions.customerTypeAll({}));
  }, []);

  useEffect(() => {
    if (customer && !customer.isLoading && customer.isCompleted && !customer.rows) {
      reset({
        name: customer.name || '',
        short: customer.short || '',
        taxId: customer.taxId || '',
        telephone: customer.telephone || '',
        fax: customer.fax || '',
        email: customer.email || '',
        address: {
          house_number: customer?.address?.house_number || '',
          village_number: customer?.address?.village_number || '',
          road: customer?.address?.road || '',
          subdistrict: customer?.address?.subdistrict || '',
          district: customer?.address?.district || '',
          province: customer?.address?.province || '',
          postcode: customer?.address?.postcode || '',
          country: customer?.address?.country || 'Thailand',
        },
        bank: {
          account_name: customer?.bank?.account_name || '',
          account_number: customer?.bank?.account_number || '',
        },
      });
      setBank(customer?.bank?.bank_name || '');
      setCustomer_status(customer?.customer_status ?? true);
      setSupplier_status(customer?.supplier_status ?? false);
    }
  }, [customer]);

  const onSubmit = async (data) => {
    try {
      data.bank = {
        bank_name: bank,
        account_name: data?.bank?.account_name,
        account_number: data?.bank?.account_number,
      };
      data.customer_status = customer_status;
      data.supplier_status = supplier_status;

      await dispatch(actions.customerPut(id, data));
      await dispatch(actions.customerGet(id));
      alert('สำเร็จ');
    } catch (error) {
      console.log(error);
    }
  };

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
          <Card className="p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <CustomerForm
                errors={errors}
                customerType={customerType}
                customer={customer}
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
EditCustomer.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

EditCustomer.defaultProps = {
  title: '',
  subtitle: '',
};
