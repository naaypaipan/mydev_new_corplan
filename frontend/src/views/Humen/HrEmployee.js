import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {
  Box,
  Typography,
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
  AlertTitle,
  IconButton,
  Divider,
  Chip,
  Avatar,
  Tooltip,
  Container,
  Stack,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import _ from 'lodash';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import { EmployeeForm } from '../../components/Forms';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

import { CSVUploadModal } from '../../components/Modal';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterListIcon from '@mui/icons-material/FilterList';
import BusinessIcon from '@mui/icons-material/Business';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '80%', md: '70%' },
  maxWidth: '900px',
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
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

function HrEmployee({ title, subtitle }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const employee = useSelector((state) => state.employee);
  const roletype = useSelector((state) => state.roletype);
  const department = useSelector((state) => state.department);
  const me = useSelector((state) => state.me);
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
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(defaultValue);
    setAddUser(false);
    setAddedEmployeeImage([]);
  };

  const handleCSVOpen = () => setCsvUploadOpen(true);
  const handleCSVClose = () => {
    setCsvUploadOpen(false);
    setCsvData([]);
  };

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
    history.push(`/humen/employee/edit/${id}`);
  };
  const handleAddToEditEmployee = async (id) => {
    history.push(`/humen/employee/add`);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  const handleSelectDepartment = (event) => {
    setSelectDepartment(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleAddFromFile = async () => {
    if (!_.isEmpty(csvData)) {
      try {
        await dispatch(actions.employeeCreate({ arr: csvData }));
        alert('สำเร็จ');
        handleCSVClose();
        await dispatch(actions.employeeAll({ name, page, size }));
      } catch (error) {
        alert('เพิ่มไม่สำเร็จ');
        console.error(error);
      }
    } else {
      alert('ไม่สามารถอ่านไฟล์รายการได้');
    }
  };

  const renderCSVUploadModal = () => (
    <CSVUploadModal
      csvData={csvData}
      setCsvData={setCsvData}
      fileTemplateURL="/filetemplate/Employee.csv"
      handleAddFromFile={handleAddFromFile}
      handleClose={handleCSVClose}
      isOpen={csvUploadOpen}
      titleName="แผนก"
      typeRows={department}
      anotherComponent={
        <Box>
          <AlertTitle sx={{ mb: 2 }}>
            โปรดแทนที่ข้อมูลใน <strong>ตำแหน่ง</strong> ด้วยรหัสดังต่อไปนี้
          </AlertTitle>
          <Typography variant="subtitle2" color="primary">
            ประเภทของตำแหน่ง
          </Typography>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              height: 280,
              overflowY: 'auto',
              mt: 1,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                >
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    ชื่อประเภทของตำแหน่ง
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>รหัส</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {_.map(roletype?.rows, (_type, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:nth-of-type(odd)': {
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                      },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.light, 0.05),
                      },
                    }}
                  >
                    <TableCell>{_type?.name} </TableCell>
                    <TableCell>{_type?._id} </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      }
    />
  );

  const renderModal = () => (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" component="h2" fontWeight="bold">
              <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              เพิ่มข้อมูลพนักงาน
            </Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
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

            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              sx={{ mt: 3 }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClose}
                startIcon={<CloseIcon />}
              >
                ยกเลิก
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<SaveIcon />}
              >
                บันทึก
              </Button>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );

  const renderHeader = () => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        gap: 2,
      }}
    >


      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={handleCSVOpen}
          color="success"
          size="small"
        >
          นำเข้าข้อมูล
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddToEditEmployee}
          color="primary"
          size="small"
        >
          เพิ่มพนักงาน
        </Button>
      </Stack>
    </Box>
  );

  const renderSearch = () => (
    <Card
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
      >
        <TextField
          label="ค้นหาพนักงาน"
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="แผนก"
          size="small"
          sx={{ minWidth: 200 }}
          value={selectDepartment}
          onChange={handleSelectDepartment}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="">ทั้งหมด</MenuItem>
          {department?.rows?.map((dept) => (
            <MenuItem key={dept._id} value={dept._id}>
              {dept.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Card>
  );

  const renderTable = () => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell width="5%">
                <Typography variant="subtitle2" fontWeight="bold">
                  ลำดับ
                </Typography>
              </TableCell>
              <TableCell width="10%">
                <Typography variant="subtitle2" fontWeight="bold">
                  รหัสพนักงาน
                </Typography>
              </TableCell>
              <TableCell width="30%">
                <Typography variant="subtitle2" fontWeight="bold">
                  ชื่อ-นามสกุล
                </Typography>
              </TableCell>
              <TableCell width="15%">
                <Typography variant="subtitle2" fontWeight="bold">
                  เบอร์โทรศัพท์
                </Typography>
              </TableCell>
              <TableCell width="20%">
                <Typography variant="subtitle2" fontWeight="bold">
                  แผนก
                </Typography>
              </TableCell>
              {me?.userData?.permissions?.hr_management && (
                <TableCell width="20%" align="right">
                  <Typography variant="subtitle2" fontWeight="bold">
                    จัดการ
                  </Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {!_.isEmpty(employee.rows) ? (
              employee.rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:nth-of-type(odd)': {
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.light, 0.05),
                    },
                  }}
                >
                  <TableCell>{(page - 1) * size + index + 1}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row?.employee_id || '-'}
                      color="default"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        alt={row.firstname}
                        src={row.image_url}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: theme.palette.primary.main,
                        }}
                      >
                        {row.firstname?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {`${row.firstname || ''} ${row.lastname || ''}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {row.phone_number ? (
                      <Typography variant="body2">
                        {row.phone_number}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        ไม่ระบุ
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {row?.department?.name ? (
                      <Chip
                        size="small"
                        label={row?.department?.name}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 400 }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        ไม่ระบุแผนก
                      </Typography>
                    )}
                  </TableCell>
                  {me?.userData?.permissions?.hr_management && (
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            history.push(`/humen/employee/detail/${row.id}`)
                          }
                        >
                          รายละเอียด
                        </Button>
                        <Tooltip title="แก้ไขข้อมูล">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handlePushToEditEmployee(row.id)}
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.warning.main, 0.2),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" color="warning" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ลบพนักงาน">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteEmployee(row?.id)}
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box
                    sx={{
                      py: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PersonAddIcon
                      sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      ไม่พบข้อมูลพนักงาน
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{ mt: 1, mb: 2 }}
                    >
                      {searchTerm || selectDepartment
                        ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา กรุณาลองค้นหาด้วยคำค้นอื่น'
                        : 'ยังไม่มีข้อมูลพนักงานในระบบ กรุณาเพิ่มข้อมูลพนักงาน'}
                    </Typography>

                    {!searchTerm && !selectDepartment && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                      >
                        เพิ่มพนักงาน
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <TablePagination
        component="div"
        count={total || 0}
        page={page - 1}
        rowsPerPage={size}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="แถวต่อหน้า:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
        }
      />
    </Card>
  );

  if (employee.isLoading) {
    return <Loading isLoading />;
  }

  if (!employee.isLoading && employee.isCompleted) {
    return (
      <div>
        {renderCSVUploadModal()}
        {renderModal()}
        {renderHeader()}
        {renderSearch()}
        {renderTable()}
      </div>
    );
  }

  return <Error />;
}

HrEmployee.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

HrEmployee.defaultProps = {
  title: '',
  subtitle: '',
};

export default HrEmployee;
