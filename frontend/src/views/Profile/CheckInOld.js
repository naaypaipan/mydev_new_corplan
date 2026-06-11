import TimeStampCard from '../../components/Card/TimeStampCard';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import * as actions from '../../redux/actions';
import Loading from 'components/Loading';
import TimeStampType2Card from 'components/Card/TimeStampType2Card';
import { useGeolocated } from 'react-geolocated';
import CalculateGps from '../../utils/functions/CalculateGps';
import CalculateSalaryperday from '../../utils/functions/CalculateSalaryperday';
import dayjs from 'dayjs';
import CalculateGpsByProject from 'utils/functions/CalculateGpsByProject';
import findProjectwithLocation from '../../utils/functions/findProjectwithLocation';

export default function CheckIn({ title, subtitle }) {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.me);
  const project = useSelector((state) => state.project);
  const info = useSelector((state) => state.info);
  const holiday = useSelector((state) => state.holiday);
  const history = useHistory();
  const [imgSrc, setImgSrc] = useState(null);
  const [noteCheckin, setNoteCheckin] = useState();
  const [projectSelect, setProjectSelect] = useState();
  const [loading, setLoading] = useState(false);

  const {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  });

  const locationCheckIn = CalculateGps(coords, project?.rows, 1000);

  const findProject = findProjectwithLocation(coords, project, 500);

  useEffect(() => {
    dispatch(actions.meGet({}));
    dispatch(actions.getInformation());
    dispatch(actions.projectAll({ time_tracking_enabled: true }));
    dispatch(actions.holidayAll({ date: dayjs().startOf('date') }));
    return () => {};
  }, []);

  const rate = CalculateSalaryperday(holiday);

  const onSubmit = async () => {
    if (!projectSelect) {
      alert('Please select a project');
    } else {
      const confirm = window.confirm('save');
      if (confirm) {
        setLoading(true);
        const data = {
          check_in_source: 'profile',
          employee: me?.userData?._id,
          employee_firstname: me?.userData?.firstname,
          employee_lastname: me?.userData?.lastname,
          employeeType: me?.userData?.type,
          salary: me?.userData?.salary,
          salary_extra: me?.userData?.salary_extra,
          status_checkIn: true,
          project_in: projectSelect,
          image: imgSrc,
          locationCheckIn,
          rate,
        };
        await dispatch(actions.timestampCreate(data));
        // await dispatch(actions.timestampAll({}));
        setLoading(false);
        history.goBack();
      }
    }
  };

  const renderCard = () => (
    <div>
      {info?.setting?.timestamp_image ? (
        <div>
          <TimeStampCard
            me={me}
            date={new Date()}
            imgSrc={imgSrc}
            setImgSrc={setImgSrc}
            noteCheckin={noteCheckin}
            setNoteCheckin={setNoteCheckin}
            project={project}
            projectSelect={projectSelect}
            setProjectSelect={setProjectSelect}
            onSubmit={onSubmit}
            locationCheck={locationCheckIn}
          />
        </div>
      ) : (
        <TimeStampType2Card
          me={me}
          date={new Date()}
          imgSrc={imgSrc}
          setImgSrc={setImgSrc}
          noteCheckin={noteCheckin}
          setNoteCheckin={setNoteCheckin}
          project={project}
          projectSelect={projectSelect}
          setProjectSelect={setProjectSelect}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );

  if (!project?.isLoading && project?.isCompleted) {
    return (
      <div>
        {loading ? <Loading loading /> : renderCard()}
      </div>
    );
  }
  return <Loading isLoading />;
}
