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
import { EmployeeForm } from '../../components/Forms';
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

const defaultValue = {
  firstname: '',
  lastname: '',
  department: '',
  role: '',
  username: '',
  password: '',
  phone_number: '',
};

function Employees({ title, subtitle }) {
  const dispatch = useDispatch();
  const employee = useSelector((state) => state.employee);
  const roletype = useSelector((state) => state.roletype);
  const department = useSelector((state) => state.department);
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
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [addedEmployeeImage, setAddedEmployeeImage] = useState([]);
  const [selectDepartment, setSelectDepartment] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    dispatch(actions.employeeAll({ name, page, size, selectDepartment }));
    dispatch(actions.roletypeAll(''));
    dispatch(actions.departmentAll({}));
    return () => {};
  }, [name, page, size, selectDepartment]);

  useEffect(() => {
    setTotal(employee?.total);
    return () => {};
  }, [employee]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setName(searchTerm);
      setPage(1);
    }, 700);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);


  console.log('Errors', errors);
  const onSubmit = async (data) => {
    try {
      console.log(data);
      // eslint-disable-next-line no-param-reassign
      const payload = {
        ...data,
        salary: {
          month: data?.salary?.month,
          day: data?.salary?.month / 30,
          hr: data?.salary?.month / 240,
        },
      };
      if (addUser === true) {
        if (data.password === data.confirmPassword) {
          await dispatch(actions.userRegister(payload));
          reset(defaultValue);
          alert('สำเร็จ');
          handleClose();
          setAddUser(false);
          await dispatch(actions.employeeAll({ name, page, size }));
        } else {
          alert('กรุณาใส่รหัสผ่านให้ตรงกัน');
        }
      } else {
        await dispatch(actions.employeeCreate(payload));
        reset(defaultValue);
        alert('สำเร็จ');
        handleClose();
        setAddUser(false);
        setAddedEmployeeImage([]);
        await dispatch(actions.employeeAll({ name, page, size }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    const confirm = window.confirm('ยืนยันการลบข้อมูล');
    if (confirm) {
      try {
        await dispatch(actions.employeeDelete(id));
        await dispatch(actions.employeeAll({ name, page, size }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handlePushToEditEmployee = async (id) => {
    history.push(`/management/employee/edit/${id}`);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  const handleSelectDepartment = (type) => {
    setSelectDepartment(type);
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
      <div className="p-4 flex flex-row gap-2">
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
          <div className="py-2">เพิ่มข้อมูลพนักงาน</div>
          <div className="py-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <EmployeeForm
                control={control}
                Controller={Controller}
                errors={errors}
                employee={employee}
                roletype={roletype}
                addUser={addUser}
                setAddUser={setAddUser}
                employeeImage={addedEmployeeImage}
                setEmployeeImage={setAddedEmployeeImage}
                department={department}
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
                  <div className="font-bold"> Name</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold"> Phone</div>
                </TableCell>

                <TableCell>
                  <div className="font-bold"> Role</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold"> </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!_.isEmpty(employee.rows) ? (
                employee.rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {(page - 1) * size + index + 1}
                    </TableCell>
                    <TableCell>{`${row.firstname} ${row.lastname}`}</TableCell>
                    <TableCell>{`${row.phone_number || '-'}`}</TableCell>
                    <TableCell>{`${row?.role?.name}`}</TableCell>
                    <TableCell>
                      <div className="flex flex-row flex-wrap gap-1">
                        <Button
                          variant="contained"
                          color={'warning'}
                          size={'small'}
                          onClick={() => handlePushToEditEmployee(row.id)}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          variant="contained"
                          color={'error'}
                          size={'small'}
                          onClick={() => {
                            handleDeleteEmployee(row?.id);
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
          rowsPerPageOptions={[]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page - 1}
          count={total || 1}
          rowsPerPage={size}
          onPageChange={handleChangePage}
        />
      </Paper>
    </div>
  );

  if (employee.isLoading) {
    return <Loading />;
  }
  if (!employee.isLoading && employee.isCompleted) {
    return (
      <div>
        {renderModal()}
        <div className="flex justify-between">

          <div className="mt-6">{renderAddButtom()}</div>
        </div>
        {renderSearch()}
        {renderTable()}
      </div>
    );
  }
  return <Error />;
}

Employees.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

Employees.defaultProps = {
  title: '',
  subtitle: '',
};

export default Employees;
