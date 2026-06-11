import { Button } from '@mui/material';
import OtRequestTable from '../../components/Table/OtRequestTable';

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import * as actions from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

export default function OvertimeRequestList({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();

  const me = useSelector((state) => state.me);
  const otRequests = useSelector((state) => state.otRequestOrder);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  useEffect(() => {
    dispatch(actions.otRequestOrderAll({ me: me?.userData?.id }));

    return () => {};
  }, []);

  const handleDelete = (id) => {
    const confirm = window.confirm('ยืนยันลบคำขอ OT ใช่หรือไม่ ?');
    if (confirm) {
      dispatch(actions.otRequestOrderDelete(id)).then(() => {
        dispatch(actions.otRequestOrderAll({ me: me?.userData?.id }));
      });
    }
  };


  const renderTable = () => (
    <OtRequestTable
      otRequest={otRequests}
      page={page}
      setPage={setPage}
      size={size}
      setSize={setSize}
      handleDelete={handleDelete}
    />
  );
  const renderButton = () => (
    <div className="flex justify-end p-1 ">
      <Button
        variant="contained"
        onClick={() => history.push('/profile/ot/add')}
        color="primary"
      >
        Request Overtime
      </Button>
    </div>
  );
  return (
    <div>
      {renderButton()}
      {renderTable()}
    </div>
  );
}
