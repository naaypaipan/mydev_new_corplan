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
import { CustomerTypeForm } from '../../components/Forms';
import Loading from '../../components/Loading';
import { Error } from '../../components/Error';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  boxShadow: 24,
  p: 4,
};

const defaultValues = {
  name: '',
  description: '',
};

export default function CustomerTypes({ title, subtitle }) {
  const dispatch = useDispatch();
  const customerType = useSelector((state) => state.customerType);
  const history = useHistory();
  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(undefined);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(defaultValues);
  };
  useEffect(() => {
    dispatch(actions.customerTypeAll({ name, page, size }));
    return () => {};
  }, [name, page, size]);

  useEffect(() => {
    setTotal(customerType?.total);
    return () => {};
  }, [customerType]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setName(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);



  const onSubmit = async (data, event) => {
    try {
      console.log(data);
      event.preventDefault();
      await dispatch(actions.customerTypeCreate(data));
      reset(defaultValues);
      alert('สำเร็จ');
      handleClose();
      await dispatch(actions.customerTypeAll({ name, page, size }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('ยืนยันการลบข้อมูล');
    if (confirm) {
      try {
        await dispatch(actions.customerTypeDelete(id));
        await dispatch(actions.customerTypeAll({ name, page, size }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handlePushToEditPage = (id) => {
    history.push(`customer-type/edit/${id}`);
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
          <div className="py-2">เพิ่มข้อมูล</div>
          <div className="py-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <CustomerTypeForm
                Controller={Controller}
                control={control}
                errors={errors}
                customerType={customerType}
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
                  <div className="font-bold">ลำดับที่</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">รหัส</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">ชื่อ</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">รายละเอียด</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">ดำเนินการ</div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!_.isEmpty(customerType.rows) ? (
                customerType.rows.map((row, index) => (
                  <TableRow
                    key={row._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {(page - 1) * size + index + 1}
                    </TableCell>
                    <TableCell>{`${row.type_code}`}</TableCell>
                    <TableCell>{`${row?.name}`}</TableCell>
                    <TableCell>{`${row?.description}`}</TableCell>
                    <TableCell>
                      <div className="flex flex-row flex-wrap gap-1">
                        <Button
                          variant="contained"
                          color={'warning'}
                          size={'small'}
                          onClick={() => handlePushToEditPage(row._id)}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          variant="contained"
                          color={'error'}
                          size={'small'}
                          // disabled
                          onClick={() => {
                            handleDelete(row?._id);
                          }}
                        >
                          ลบ
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="text-center">ไม่มีข้อมูล</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page - 1}
          count={total || 1}
          rowsPerPage={size}
          onPageChange={handleChangePage}
        />
      </Paper>
    </div>
  );

  if (customerType.isLoading) {
    return <Loading />;
  }
  if (!customerType.isLoading && customerType.isCompleted) {
    return (
      <div>
        {renderModal()}
        {renderAddButtom()}
        {renderSearch()}
        {renderTable()}
      </div>
    );
  }
  return <Error message={customerType?.message} />;
}

CustomerTypes.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

CustomerTypes.defaultProps = {
  title: '',
  subtitle: '',
};
