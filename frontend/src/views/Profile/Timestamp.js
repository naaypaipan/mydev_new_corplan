
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import ListTimestamp from '../../components/Card/ListTimestamp';
import Loading from 'components/Loading';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useForm, Controller } from 'react-hook-form';
import OtRequireForm from 'components/Forms/OtRequireForm';
import { Button } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',

  boxShadow: 24,
  p: 4,
};

export default function Timestamp({ title, subtitle }) {
  const dispatch = useDispatch();
  const timestamp = useSelector((state) => state.timestamp);
  const me = useSelector((state) => state.me);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    dispatch(actions.meGet());
    dispatch(actions.timestampCheckin({ me: me?.userData?._id }));

    return () => {};
  }, []);

  const renderButton = () => (
    <ListTimestamp timestamp={timestamp} setOpen={setOpen} />
  );

  if (
    !timestamp?.isLoading &&
    timestamp?.isCompleted &&
    !me?.isLoading &&
    me?.isCompleted
  ) {
    return (
      <div>
        <div>{renderButton()}</div>
      </div>
    );
  }
  return <Loading isLoading />;
}
