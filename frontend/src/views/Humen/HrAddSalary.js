import FilterAddHrSalary from '../../components/Card/FilterAddHrSalary';

import React, { useEffect, useState } from 'react';
import * as actions from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import HrDashboardCard from '../../components/Card/HrDashboardCard';
import dayjs from 'dayjs';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import AddSalaryTable from '../../components/Table/AddSalaryTable';
import {
  Button,
  CircularProgress,
  Box,
  Modal,
  Typography,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import AddPayrollDailyTable from '../../components/Table/AddPayrollDailyTable';
import CalSSO from '../../utils/functions/CalSSO';
import TimestampProjectCost from '../../components/Table/TimestampProjectCost';
import { Dashboard } from '@mui/icons-material';

export default function HrAddSalary({ title, subtitle }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const timestamp = useSelector((state) => state.timestamp);
  const roletype = useSelector((state) => state.roletype);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      salaryData: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'salaryData',
  });

  const [dateStart, setDateStart] = useState([new Date(), new Date()]);

  const [typeSelect, setTypeSelect] = useState('FULLTIME');
  const [projectSelect, setProjectSelect] = useState();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  // State สำหรับ Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectEachEmployee, setSelectEachEmployee] = useState(null);

  const onChangeRoll = (data) => {
    dispatch(actions.timestampReset());
    setTypeSelect(data);
  };

  useEffect(() => {
    dispatch(actions.roletypeAll({}));
    dispatch(actions.timestampReset());
    return () => {};
  }, []);

  useEffect(() => {
    setValue('salaryData', timestamp?.rows || []);
    // dispatch(actions.roletypeAll({}));a  return () => {};
  }, [timestamp, typeSelect]);

  // เพิ่ม loading state ระหว่างดึงข้อมูล
  const handleClickFetch = async () => {
    setLoading(true);
    await dispatch(
      actions.timestampPayroll({
        dateStart: dayjs(dateStart[0]).startOf('day').toDate(),
        dateEnd: dayjs(dateStart[1]).endOf('day').toDate(),
        typeSelect: typeSelect,
      }),
    );
    setLoading(false);
  };
  // ฟังก์ชันเปิด Modal
  const handleOpenModal = (data) => {
    setSelectEachEmployee(data);
    setOpenModal(true);
  };

  // ฟังก์ชันปิด Modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectEachEmployee('');
  };

  const onSubmit = async (data) => {
    const total_tax = data.salaryData.reduce(
      (sum, item) => sum + parseFloat(item?.expenses?.tax || 0),
      0,
    );
    const total_sso = data.salaryData.reduce(
      (sum, item) => sum + parseFloat(item?.expenses?.sso || 0),
      0,
    );
    const total_late = data.salaryData.reduce(
      (sum, item) => sum + parseFloat(item?.expenses?.late || 0),
      0,
    );

    const total = data.salaryData.reduce((sum, item) => {
      const salary = parseFloat(item?.revenue?.salary || 0);
      const overtime = parseFloat(item?.revenue?.overtime || 0);
      const allowances = parseFloat(item?.revenue?.allowances || 0);
      const bonus = parseFloat(item?.revenue?.bonus || 0);
      const tax = parseFloat(item?.expenses?.tax || 0);
      const sso = parseFloat(item?.expenses?.sso || 0);
      const late = parseFloat(item?.expenses?.late || 0);
      const other = parseFloat(item?.expenses?.other || 0);

      let itemTotal = 0;
      if (typeSelect === 'FULLTIME') {
        itemTotal = salary - tax - sso - late - other;
      } else {
        itemTotal = salary + overtime + allowances + bonus - tax - sso - late - other;
      }
      return sum + itemTotal;
    }, 0);

    const dataSubmit = {
      dateStart: dateStart[0],
      dateEnd: dateStart[1],
      role_type: typeSelect,
      total_tax,
      total_sso,
      total_late,
      total,
      timestampList: [...data?.salaryData?.map((e) => e.checkins).flat()],
      salaryData: data.salaryData.map((eachdata) => ({
        ...eachdata,
        employee: eachdata?.employee_id,
        payrollType: typeSelect,
        sso_percentage: eachdata?.sso,
        expenses: {
          ...eachdata?.expenses,
          // sso: CalSSO(eachdata?.employeeDetails?.salary?.month, watch('sso')),
        },

        total:
          typeSelect === 'FULLTIME'
            ? parseFloat(eachdata?.revenue?.salary) +
              parseFloat(eachdata?.revenue?.overtime || 0) +
              parseFloat(eachdata?.revenue?.allowances || 0) +
              parseFloat(eachdata?.revenue?.bonus || 0) -
              parseFloat(eachdata?.expenses?.other || 0) -
              parseFloat(eachdata?.expenses?.tax || 0) -
              parseFloat(eachdata?.expenses?.sso || 0) -
              parseFloat(eachdata?.expenses?.late || 0)
            : parseFloat(eachdata?.revenue?.salary) +
              parseFloat(eachdata?.revenue?.overtime || 0) +
              parseFloat(eachdata?.revenue?.allowances || 0) +
              parseFloat(eachdata?.revenue?.bonus || 0) -
              parseFloat(eachdata?.expenses?.tax || 0) -
              parseFloat(eachdata?.expenses?.sso || 0) -
              parseFloat(eachdata?.expenses?.late || 0) -
              parseFloat(eachdata?.expenses?.other || 0),
      })),
      dashboard: timestamp?.dashboard || [],
      note: note,
    };

    await dispatch(actions.salaryListCreate(dataSubmit));
    dispatch(actions.salaryListAll({}));
    history.push('/humen/salarylist');
    // Here you can handle the form submission, e.g., send data to the server
  };


  const renderFilter = () => (
    <div className="">
      <FilterAddHrSalary
        dateStart={dateStart}
        setDateStart={setDateStart}
        selectedRole={typeSelect}
        setSelectedType={setTypeSelect}
        roletype={roletype}
        handleClickFetch={handleClickFetch}
        onChangeRoll={onChangeRoll}
      />
    </div>
  );
  {
    /* ตัวอย่างปุ่มเปิดโมดอล */
  }
  <Button
    variant="outlined"
    onClick={() => handleOpenModal('รายละเอียดหรือข้อความในโมดอล')}
  >
    เปิดโมดอล
  </Button>;

  const renderSalaryTable = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      ) : typeSelect === 'FULLTIME' ? (
        <div>
          <AddSalaryTable
            fields={fields}
            Controller={Controller}
            control={control}
            watch={watch}
            setValue={setValue}
            setTotal={setTotal}
            remove={remove}
            handleOpenModal={handleOpenModal}
          />
        </div>
      ) : (
        <div>
          <AddPayrollDailyTable
            fields={fields}
            Controller={Controller}
            control={control}
            watch={watch}
            setValue={setValue}
            setTotal={setTotal}
            remove={remove}
            handleOpenModal={handleOpenModal}
          />
        </div>
      )}
    </form>
  );

  const renderModal = () => {
    return (
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            maxHeight: '70vh',
            overflowY: 'auto',
            minWidth: 400,
          }}
        >
          {/* ปุ่ม X ปิดโมดอล */}
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <Button
              onClick={handleCloseModal}
              sx={{
                minWidth: 0,
                p: 0.5,
                borderRadius: '50%',
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 700 }}>&times;</span>
            </Button>
          </Box>
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
            รายการลงเวลา
          </Typography>
          <Typography id="modal-description" sx={{ mb: 2 }}>
            <Stack spacing={1}>
              <Table size="small" sx={{ minWidth: 400 }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      วันที่
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      โครงการ
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      เข้า
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      ออก
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      วัน
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      หมายเหตุ
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {_?.map(selectEachEmployee, (e, idx) => (
                    <TableRow key={idx}>
                      <TableCell align="center">
                        {dayjs(e?.checkIn).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell align="center">
                        {e?.project_number || '-'} {e?.project_name || '-'}
                      </TableCell>
                      <TableCell align="center">
                        {e?.checkInTime || '-'}
                      </TableCell>
                      <TableCell align="center">
                        {e?.checkOutTime || '-'}
                      </TableCell>
                      <TableCell align="center">
                        {e?.totalTime || '-'}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color: e?.note ? 'warning.main' : 'text.secondary',
                        }}
                      >
                        {e?.note || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Typography>
        </Box>
      </Modal>
    );
  };
  // const renderProjectCost = () => (
  //   <div>
  //     <TimestampProjectCost timestamp={timestamp} />
  //   </div>
  // );

  const renderNote = () => (
    <div className="mb-4">
      <Card>
        <div className="p-4">
          <TextField
            label="หมายเหตุ"
            multiline
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
          />
        </div>
      </Card>
    </div>
  );

  return (
    <div>

      {renderFilter()}
      {renderSalaryTable()}
      {renderNote()}
      {/* {renderProjectCost()} */}
      {renderModal()}
    </div>
  );
}
