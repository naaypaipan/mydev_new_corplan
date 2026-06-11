import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';

import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import OtRequestForm from '../../components/Forms/OtRequestForm';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CalOthour from 'utils/functions/CalOthour';

export default function AddOt({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();

  const timestamp = useSelector((state) => state.timestamp);
  const project = useSelector((state) => state.project);
  const me = useSelector((state) => state.me);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();
  const [requestForOther, setRequestForOther] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState();
  const [claimOT, setClaimOT] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [rate, setRate] = useState(1.5);

  useEffect(() => {
    dispatch(actions.meGet({}));
    dispatch(actions.projectAll({}));
    fetchTimestamp();
    return () => {};
  }, [date, selectedProject]);

  const fetchTimestamp = async () => {
    await dispatch(
      actions.timestampAll({
        dateStart: dayjs(date).startOf('day').toISOString(),
        dateEnd: dayjs(date).endOf('day').toISOString(),
        project_id: selectedProject?._id,
      }),
    );
  };

  const onSubmit = async (data) => {
    const confirm = window.confirm('ต้องการบันทึกข้อมูลใช่หรือไม่ ?');
    if (confirm) {
      if (selectedEmployees.length === 0) {
        alert('กรุณาเลือกพนักงาน');
        return;
      }
      if (!selectedProject) {
        alert('กรุณาเลือก Project');
        return;
      }
      try {
        const h = await CalOthour(data.startTime, data.endTime);
        const dataSubmit = {
          ...data,
          resquester: me?.userData?.id,
          project: selectedProject?._id,
          timestamp: selectedEmployees,
          status_claim: claimOT,
          rate,
          total_hours: h.toFixed(1),
        };

        await dispatch(actions.otRequestOrderCreateWithNotify(dataSubmit));
        alert('ส่งคำขอ OT เรียบร้อยแล้ว');
        history.push('/humen/ot-request');
      } catch (err) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'เกิดข้อผิดพลาดในการส่งคำขอ OT';
        alert(msg);
      }
    }
  };


  const renderForm = () => (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <OtRequestForm
          control={control}
          Controller={Controller}
          timestamp={timestamp}
          project={project}
          requestForOther={requestForOther}
          setRequestForOther={setRequestForOther}
          selectedEmployees={selectedEmployees}
          setSelectedEmployees={setSelectedEmployees}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          claimOT={claimOT}
          setClaimOT={setClaimOT}
          date={date}
          setDate={setDate}
          fetchTimestamp={fetchTimestamp}
          rate={rate}
          setRate={setRate}
          rateApprove={true}
        />
      </form>
    </div>
  );
  return (
    <div>

      {renderForm()}
    </div>
  );
}
