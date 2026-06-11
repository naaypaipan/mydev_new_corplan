import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Card, Button } from '@mui/material';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { CustomerTypeForm } from '../../components/Forms';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';


export default function EditCustomerType({ title, subtitle }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const customerType = useSelector((state) => state.customerType);

  const {
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      name: customerType.name,
      type_code: customerType.type_code,
      description: customerType.description,
    },
  });

  useEffect(() => {
    dispatch(actions.customerTypeGet(id));
    return () => {};
  }, []);



  const onSubmit = async (data) => {
    try {
      console.log(data);
      await dispatch(actions.customerTypePut(id, data));
      await dispatch(actions.customerTypeGet(id));
      alert('สำเร็จ');
    } catch (error) {
      console.log(error);
    }
  };
  if (customerType.isLoading || customerType.rows) {
    return <Loading />;
  }
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
              <CustomerTypeForm
                errors={errors}
                customerType={customerType}
                control={control}
                Controller={Controller}
              />
              <div className="flex flex-row justify-end gap-1 py-4">
                <Button variant="contained" type="submit">
                  บันทึก
                </Button>
                <div></div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }
  return <Error />;
}

EditCustomerType.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

EditCustomerType.defaultProps = {
  title: '',
  subtitle: '',
};
