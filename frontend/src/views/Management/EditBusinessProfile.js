import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Card, Button } from '@mui/material';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import _ from 'lodash';

import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { Loading } from '../../components/Loading';


import { EditInformationForm } from '../../components/Forms';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

export default function EditBusinessProfile({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const info = useSelector((state) => state.info);

  const {
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    //   defaultValues: {
    //     firstname: employee.firstname,
    //     lastname: employee.lastname,
    //     role: roletype.id,
    //     phone_number: employee.phone_number,
    //   },
  });
  const onSubmit = async (data) => {
    const confirm = window.confirm('confirm');
    if (confirm) {
      await dispatch(actions.editOneInformation(id, data));
      await dispatch(actions.getInformation());
      history.goBack();
    }
  };

  useEffect(() => {
    dispatch(actions.getInformation());

    return () => {};
  }, []);



  const renderForm = () => (
    <div>
      <Card>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <EditInformationForm
              control={control}
              Controller={Controller}
              info={info}
            />
            <div className="flex flex-row justify-center gap-1 py-4">
              <Button variant="contained" type="submit">
                บันทึก
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );

  return (
    <div>

      {renderForm()}
    </div>
  );
}
