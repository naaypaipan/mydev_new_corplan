import { Button, Card } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import HrcheckinList from '../../components/Table/HrcheckinList';
import FilterTimestampCard from '../../components/Card/FilterTimestampCard';
export default function HrTimestampList({ title, subtitle }) {
  const history = useHistory();
  const dispatch = useDispatch();

  const timestamp = useSelector((state) => state.timestamp);
  const employees = useSelector((state) => state.employee);
  const info = useSelector((state) => state.info);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [emSelect, setEmSelect] = useState();
  const [dateStart, setDateStart] = useState(new Date());
  const [dateEnd, setDateEnd] = useState(new Date());

  useEffect(() => {
    dispatch(actions.timestampAll({ size, page, emSelect }));
    dispatch(actions.employeeAll({}));
    dispatch(actions.getInformation());

    return () => {};
  }, [page, size, emSelect]);

  // Socket.IO real-time listeners
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    const refresh = () =>
      dispatch(actions.timestampAll({ size, page, emSelect }));

    socket.on('timestamp:created', refresh);
    socket.on('timestamp:updated', refresh);
    socket.on('timestamp:deleted', refresh);

    return () => {
      socket.off('timestamp:created', refresh);
      socket.off('timestamp:updated', refresh);
      socket.off('timestamp:deleted', refresh);
    };
  }, [socket, page, size, emSelect]);

  const renderCardQuery = () => (
    <div>
      <FilterTimestampCard
        employees={employees}
        emSelect={emSelect}
        setEmSelect={setEmSelect}
        dateStart={dateStart}
        dateEnd={dateEnd}
        setDateStart={setDateStart}
        setDateEnd={setDateEnd}
      />
    </div>
  );

  const renderTable = () => (
    <HrcheckinList
      timestamp={timestamp}
      page={page}
      size={size}
      setPage={setPage}
      setSize={setSize}
      show={info?.setting?.timestamp_image}
    />
  );

  return (
    <div>
      <div className="py-1">{renderCardQuery()}</div>
      <div>{renderTable()}</div>
    </div>
  );
}
