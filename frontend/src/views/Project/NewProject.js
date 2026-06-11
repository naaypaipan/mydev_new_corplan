import React, { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { ProjectForm } from '../../components/Forms';
import * as actions from '../../redux/actions';
import { useForm, Controller } from 'react-hook-form';
import { Button, Card } from '@mui/material';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

export default function NewProject({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();
  const employee = useSelector((state) => state.employee);

  const [date, setDate] = useState(new Date());
  const [dateEnd, setDateEnd] = useState(new Date());
  const [includeVAT, setIncludeVAT] = useState(false);
  const [cost, setCost] = useState(); // State for cost input
  const [extraGpsSites, setExtraGpsSites] = useState([]);

  useEffect(() => {
    dispatch(actions.employeeAll({}));

    return () => {};
  }, []);



  const onSubmit = async (data) => {
    const confirm = window.confirm('บันทึก');
    if (confirm) {
      const gpsSitesPayload = extraGpsSites
        .map((s) => ({
          name: (s.name || '').trim(),
          lat: s.lat !== '' && s.lat != null ? parseFloat(s.lat) : NaN,
          lon: s.lon !== '' && s.lon != null ? parseFloat(s.lon) : NaN,
        }))
        .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lon));

      const latRaw = data?.gps?.lat ?? data['gps.lat'];
      const lonRaw = data?.gps?.lon ?? data['gps.lon'];
      const lat =
        latRaw !== '' && latRaw != null ? parseFloat(latRaw, 10) : NaN;
      const lon =
        lonRaw !== '' && lonRaw != null ? parseFloat(lonRaw, 10) : NaN;
      const gpsPayload =
        Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : undefined;

      const dataSubmit = {
        ...data,
        date_start: date,
        date_end: dateEnd,
        cost: cost,
        vat: includeVAT ? 0 : cost * 0.07, // Assuming VAT is 7%
        gps: gpsPayload,
        gps_sites: gpsSitesPayload,
      };
      await dispatch(actions?.projectCreate(dataSubmit));
      dispatch(actions?.projectAll({}));
      history.goBack();
    }
  };

  const renderForm = () => (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={'p-2'}>
          <ProjectForm
            Controller={Controller}
            control={control}
            date={date}
            setDate={setDate}
            dateEnd={dateEnd}
            setDateEnd={setDateEnd}
            employee={employee?.rows}
            includeVAT={includeVAT}
            setIncludeVAT={setIncludeVAT}
            cost={cost}
            setCost={setCost}
            extraGpsSites={extraGpsSites}
            setExtraGpsSites={setExtraGpsSites}
          />
          <div className="flex justify-center py-4">
            <Button variant="contained" type="submit">
              บันทึก
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
  return (
    <div>
      <div>{renderForm()}</div>
    </div>
  );
}
