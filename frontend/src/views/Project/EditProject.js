
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectForm } from 'components/Forms';
import * as actions from '../../redux/actions';
import { useForm, Controller } from 'react-hook-form';
import { Button, Card } from '@mui/material';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import logger from 'redux-logger';

export default function EditProject({ title, subtitle }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const history = useHistory();
  const project = useSelector((state) => state.project);
  const employee = useSelector((state) => state.employee);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  const [date, setDate] = useState(project?.date_start);
  const [dateEnd, setDateEnd] = useState(project?.date_end);
  const [includeVAT, setIncludeVAT] = useState(false);
  const [cost, setCost] = useState(); // State for cost input
  const [extraGpsSites, setExtraGpsSites] = useState([]);

  useEffect(() => {
    dispatch(actions?.projectGet(id));
    dispatch(actions.employeeAll({}));

    return () => {};
  }, []);

  useEffect(() => {
    setValue('engineer', project?.engineer?._id);
    setValue('name', project?.name);
    setValue('project_number', project?.project_number);
    setValue('description', project?.description);
    setValue('customer', project?.customer);
    setValue('place', project?.place);
    setCost(project?.cost);
    setValue('labur_cost', project?.labur_cost);
    setValue('gps.lat', project?.gps?.lat);
    setValue('gps.lon', project?.gps?.lon);
    setIncludeVAT(project?.include_vat);
    const sites = project?.gps_sites;
    setExtraGpsSites(
      Array.isArray(sites) && sites.length
        ? sites.map((s) => ({
            name: s.name || '',
            lat: s.lat != null ? String(s.lat) : '',
            lon: s.lon != null ? String(s.lon) : '',
          }))
        : [],
    );

    return () => {};
  }, [project]);

  const onSubmit = (data) => {
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
        vat: includeVAT ? 0 : cost * 0.07,
        include_vat: includeVAT,
        gps: gpsPayload,
        gps_sites: gpsSitesPayload,
      };

      dispatch(actions?.projectPut(id, dataSubmit));
      dispatch(actions?.projectGet(id));
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
          <div className="flex justify-center">
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
