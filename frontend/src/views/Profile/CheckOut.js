import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import * as actions from '../../redux/actions';

import Loading from 'components/Loading';
import TimeStampCheckOutCard from '../../components/Card/TimeStampCheckOutCard';
import dayjs from 'dayjs';
import CalculateSalaryperday from '../../utils/functions/CalculateSalaryperday';
import CalculateSalaryOtperday from '../../utils/functions/CalculateSalaryOtperday';
import TimeStampCheckOutType2Card from '../../components/Card/TimeStampCheckOutType2Card';

export default function CheckOut({ title, subtitle }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const timestamp = useSelector((state) => state.timestamp);
  const me = useSelector((state) => state.me);
  const project = useSelector((state) => state.project);
  const holiday = useSelector((state) => state.holiday);
  const info = useSelector((state) => state.info);

  const [imgSrc, setImgSrc] = useState(null);

  const [noteCheckin, setNoteCheckin] = useState();
  const [projectSelect, setProjectSelect] = useState(timestamp?.project_in);

  const extra = CalculateSalaryperday(holiday);
  const extra_ot = CalculateSalaryOtperday(holiday);

  useEffect(() => {
    dispatch(actions.timestampGet(id));
    dispatch(actions.meGet({}));
    dispatch(actions.projectAll({}));
    dispatch(actions.getInformation());
    dispatch(actions.holidayAll({ date: dayjs().startOf('date') }));
    setProjectSelect(project?.rows?.project_in);
    return () => {};
  }, []);

  const onSubmit = async () => {
    // if (!projectSelect) {
    //   alert('Please select a project');
    // } else {
    const confirm = window.confirm('save');
    if (confirm) {
      const data = {
        employee: me?.userData?._id,
        status_checkOut: true,
        project_out: timestamp?.project_in,
        image_out: imgSrc,
        salary: me?.userData?.salary,
        employee_firstname: me?.userData?.firstname,
        employee_lastname: me?.userData?.lastname,
        salary: me?.userData?.salary,
        // salary_extra: me?.userData?.salary_extra,
        checkIn: timestamp?.checkIn,
      };
      await dispatch(actions.timestampPut(id, data));
      // await dispatch(actions.timestampAll({}));
      history.goBack();
    }
    // }
  };


  const renderCard = () => (
    <div>
      {info?.setting?.timestamp_image ? (
        <TimeStampCheckOutCard
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
      ) : (
        <TimeStampCheckOutType2Card
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

  if (!timestamp?.isLoading && timestamp?.isCompleted) {
    return (
      <div>
        {renderCard()}
      </div>
    );
  }
  return <Loading isLoading />;
}
