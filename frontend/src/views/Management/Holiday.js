/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {
  Backdrop,
  Button,
  Card,
  Fade,
  Modal,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import _ from 'lodash';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import { holidayForm } from '../../components/Forms';
import Loading from '../../components/Loading';
import { Error } from '../../components/Error';

import HolidayForm from 'components/Forms/HolidayForm';
import dayjs from 'dayjs';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  boxShadow: 24,
  p: 4,
};

const defaultValue = { name: '', description: '' };

export default function Holiday({ title, subtitle }) {
  const dispatch = useDispatch();
  const holiday = useSelector((state) => state.holiday);
  const history = useHistory();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [total, setTotal] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    dispatch(actions.holidayAll({ name, page, size }));
  }, [name, page, size]);

  useEffect(() => {
    setTotal(holiday?.total);
    return () => {};
  }, [holiday]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setName(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);



  const onSubmit = async (data) => {
    try {
      const dataSubmit = { ...data, date };
      await dispatch(actions.holidayCreate(dataSubmit));
      reset(defaultValue);
      alert('สำเร็จ');
      handleClose();
      await dispatch(actions.holidayAll({ name, page, size }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteholiday = async (id) => {
    const confirm = window.confirm('ยืนยันการลบข้อมูล');
    if (confirm) {
      try {
        await dispatch(actions.holidayDelete(id));
        await dispatch(actions.holidayAll({ name, page, size }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handlePushToEditholiday = (id) => {
    history.push(`holiday/edit/${id}`);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const renderAddButtom = () => (
    <div className="flex flex-row justify-end pb-4">
      <div>
        <Button variant="contained" onClick={handleOpen}>
          เพิ่ม
        </Button>
      </div>
    </div>
  );

  const renderSearch = () => (
    <Card>
      <div className="p-4 flex flex-row">
        <div className="w-full md:w-1/2">
          <TextField
            label="ค้นหา"
            fullWidth
            size={'small'}
            id="outlined-start-adornment"
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="fas fa-search"></i>
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>
    </Card>
  );

  const renderModal = () => (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Card sx={style} className="max-w-4xl">
          <div className="py-2">new holiday</div>
          <div className="py-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <HolidayForm
                control={control}
                Controller={Controller}
                errors={errors}
                holiday={holiday}
                date={date}
                setDate={setDate}
              />
              <div className="flex flex-row justify-end gap-1 py-4">
                <Button variant="contained" type="submit">
                  บันทึก
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </Fade>
    </Modal>
  );

  const renderTable = () => (
    <div className="my-2">
      <Paper>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <div className="font-bold">No.</div>
                </TableCell>

                <TableCell>
                  <div className="font-bold"> name</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold"> Date</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold"> </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!_.isEmpty(holiday.rows) ? (
                holiday.rows.map((row, index) => (
                  <TableRow
                    key={row._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {(page - 1) * size + index + 1}
                    </TableCell>
                    <TableCell>{`${row.name}`}</TableCell>
                    <TableCell>{`${
                      dayjs(row?.date).format('DD/MM/YY') || ' - '
                    }`}</TableCell>
                    <TableCell>
                      <div className="flex flex-row flex-wrap gap-1">
                        <Button
                          variant="contained"
                          color={'error'}
                          size={'small'}
                          onClick={() => {
                            handleDeleteholiday(row?._id);
                          }}
                        >
                          del
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="text-center">No items</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[10, 20, 30, 100]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page - 1}
          count={total || 1}
          rowsPerPage={size}
          onPageChange={handleChangePage}
        />
      </Paper>
    </div>
  );

  if (holiday.isLoading) {
    return <Loading />;
  }
  if (!holiday.isLoading && holiday.isCompleted) {
    return (
      <div>
        {renderModal()}

        {renderAddButtom()}
        {/* {renderSearch()} */}
        {renderTable()}
      </div>
    );
  }
  return <Error message={holiday?.message} />;
}
