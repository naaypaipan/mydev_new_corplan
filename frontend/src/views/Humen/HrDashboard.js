import React, { useEffect, useState } from 'react';

import * as actions from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import HrDashboardCard from '../../components/Card/HrDashboardCard';
import dayjs from 'dayjs';
import FilterTimestampDashboardCard from '../../components/Card/FilterTimestampDashboardCard';
import Loading from 'components/Loading';
import { Card } from '@mui/material';
import timestampDashboardReport from '../../components/PDF/timestampDashboardReport';

export default function HrDashboard({ title, subtitle }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const timestamp = useSelector((state) => state.timestamp);
  const project = useSelector((state) => state.project);
  const roletype = useSelector((state) => state.roletype);
  const me = useSelector((state) => state.me);

  const [dateStart, setDateStart] = useState([
    dayjs().startOf('month').toDate(),
    dayjs().endOf('day').toDate(),
  ]);
  const [roleSelect, setRoleSelect] = useState();
  const [projectSelect, setProjectSelect] = useState();

  //   const timestampGroup = _.groupBy(timestamp?.rows, (t) => t.project_in?._id);
  //   console.log(timestampGroup);

  useEffect(() => {
    dispatch(actions.projectAll({}));
    dispatch(actions.roletypeAll({}));
    return () => {};
  }, []);

  useEffect(() => {
    dispatch(actions.timestampReset());
    dispatch(
      actions.timestampDashboard({
        dateStart: dayjs(dateStart[0]).startOf('day').toDate(),
        dateEnd: dayjs(dateStart[1]).endOf('day').toDate(),
      }),
    );
    return () => {};
  }, [dateStart]);

  const handlePrint = () => {
    timestampDashboardReport(timestamp, dateStart, me);
  };


  const renderCard = () => <HrDashboardCard timestamp={timestamp} />;
  const renderCardQuery = () => (
    <div>
      <FilterTimestampDashboardCard
        dateStart={dateStart}
        setDateStart={setDateStart}
        project={project}
        setProjectSelect={setProjectSelect}
        projectSelect={projectSelect}
        roletype={roletype}
        setRoleSelect={setRoleSelect}
        handlePrint={handlePrint}
      />
    </div>
  );

  if (timestamp.isLoading || !timestamp.isCompleted) {
    return <Loading isLoading />;
  }
  if (!timestamp.isLoading && timestamp.isCompleted) {
    return (
      <div>

        <Card>
          {renderCardQuery()}
          {renderCard()}
        </Card>
      </div>
    );
  }
  return <Loading isLoading />;
}
