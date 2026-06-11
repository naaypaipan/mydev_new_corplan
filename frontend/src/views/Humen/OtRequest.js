import OtCheckRe from '../../components/Table/OtCheckRe';
import { Button, Card } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Loading from 'components/Loading';
import dayjs from 'dayjs';
import FilterOtCard from 'components/Card/FilterOtCard';

export default function OtRequest({ title, subtitle }) {
  const history = useHistory();
  const dispatch = useDispatch();


  const timestamp = useSelector((state) => state.otRequestOrder);
  const me = useSelector((state) => state.me);
  const project = useSelector((state) => state.project);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [dateStart, setDateStart] = useState(dayjs());
  const [projectSelect, setProjectSelect] = useState();

  useEffect(() => {
    // dispatch(actions.timestampAll({ size, page, ot: true }));
    dispatch(actions.otRequestOrderAll({ size, page }));
    dispatch(actions.getInformation());
    dispatch(actions.meGet());

    return () => {};
  }, [page, size, dateStart, projectSelect]);

  useEffect(() => {
    dispatch(actions.projectAll({}));

    return () => {};
  }, []);

  const renderApprove = async (each) => {
    const datasubmit = {
      ...each,
      status_approve: {
        approve: true,
        approver: me?.userData?.id,
      },
      status: 'APPROVE',
    };
    await dispatch(actions.otRequestOrderPut(each?.id, datasubmit));
    dispatch(actions.otRequestOrderAll({}));
  };

  const handleAddOt = () => {
    history.push('/humen/ot-request/add');
  };

  const renderReject = async (each) => {
    const cofirm = window.confirm('confirm');
    if (cofirm) {
      const datasubmit = {
        ...each,
        status_approve: {
          approve: true,
          approver: me?.userData?.id,
        },
        status: 'REJECT',
      };
      await dispatch(actions.otRequestOrderPut(each?.id, datasubmit));
      dispatch(actions.otRequestOrderAll({}));
    }
  };

  const renderReset = async (each) => {
    const cofirm = window.confirm('confirm');
    if (cofirm) {
      const datasubmit = {
        ...each,
        status_approve: {
          approve: false,
          approver: me?.userData?.id,
        },
        status: 'PENDING',
      };
      await dispatch(actions.otRequestOrderPut(each?.id, datasubmit));
      dispatch(actions.otRequestOrderAll({}));
    }
  };

  const renderCancel = async (each) => {
    const datasubmit = {
      ...each,
      status_approve: {
        approve: true,
        approver: me?.userData?.id,
      },
      status: 'CANCEL',
    };
    await dispatch(actions.otRequestOrderPut(each?.id, datasubmit));
    dispatch(actions.otRequestOrderAll({}));
  };

  const renderEditButton = (each) => {
    history.push(`/humen/ot-request/edit/${each?.id}`);
  };

  const renderTaableCheck = () => (
    <div>
      <OtCheckRe
        timestamp={timestamp}
        renderApprove={renderApprove}
        renderReject={renderReject}
        renderCancel={renderCancel}
        renderEditButton={renderEditButton}
        renderReset={renderReset}
        page={page}
        setPage={setPage}
        size={size}
        setSize={setSize}
      />
    </div>
  );

  const renderFillter = () => (
    <FilterOtCard
      setDateStart={setDateStart}
      projectSelect={projectSelect}
      setProjectSelect={setProjectSelect}
      project={project}
      dateStart={dateStart}
    />
  );

  const renderButtonAdd = () => (
    <Button variant="contained" onClick={handleAddOt}>
      เพิ่มคำขอ OT
    </Button>
  );

  return (
    <div>
      {/* <div>{renderFillter()}</div> */}
      <div className="flex justify-end py-1">{renderButtonAdd()}</div>
      <div>{renderTaableCheck()}</div>
      {/* <div>{renderTableClaim()}</div> */}
    </div>
  );
}
