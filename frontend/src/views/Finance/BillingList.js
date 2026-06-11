import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';


import { Box, Button, Modal, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { BillingForm } from 'components/Forms';
import BillingTable from '../../components/Table/BillingTable';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function BillingList({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  const customer = useSelector((state) => state.customer);
  const billing = useSelector((state) => state.billing);
  const project = useSelector((state) => state.project);
  const me = useSelector((state) => state.me);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [open, setOpen] = React.useState(false);
  const [dateBilling, setDateBilling] = useState(null);
  const [dueDateBilling, setDueDateBilling] = useState(null);

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  useEffect(() => {
    dispatch(actions.customerAll({}));
    dispatch(actions.billingAll({}));
    dispatch(actions.projectAll({ billing: true }));
    dispatch(actions.meGet());
    return () => {};
  }, [page, size]);

  const onSubmit = async (data) => {
    const confirm = window.confirm('บันทึกข้อมูล');
    if (confirm) {
      const dataSubmit = {
        ...data,
        employee: me?.userData?._id,
        date: dateBilling,
        date_due: dueDateBilling,
        date_confirm: dueDateBilling,
      };

      await dispatch(actions.billingCreate(dataSubmit));
      await dispatch(actions.billingAll({}));
      reset();
      handleClose();
    }
  };

  const renderModal = () => (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          ></Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <BillingForm
              control={control}
              Controller={Controller}
              project={project}
              customer={customer}
              setValue={setValue}
              dueDateBilling={dueDateBilling}
              setDueDateBilling={setDueDateBilling}
              dateBilling={dateBilling}
              setDateBilling={setDateBilling}
            />
            <div className="flex justify-center pt-4">
              <Button type="submit" variant="contained">
                save
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
  const renderAddButton = () => (
    <div className="flex justify-end py-1">
      <Button variant="contained" onClick={handleOpen}>
        Billing
      </Button>
    </div>
  );


  const rederDetail = (id) => {
    history.push(`/finance/billing/detail/${id}`);
  };

  const renderTable = () => (
    <BillingTable
      billing={billing}
      page={page}
      size={size}
      setPage={setPage}
      setSize={setSize}
      rederDetail={rederDetail}
    />
  );

  return (
    <div>
      {renderModal()}
      {renderAddButton()}
      <div>{renderTable()}</div>
    </div>
  );
}
