import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import dayjs from 'dayjs';
import {
  Box,
  Typography,
  Modal,
  Button,
  Paper,
  Container,
  Divider,
  IconButton,
  Chip,
  Fade,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  Popover,
  Badge,
  Collapse,
} from '@mui/material';

import * as actions from '../../redux/actions';
import HrcheckinList from '../../components/Table/HrcheckinList';
import { timestampReport } from '../../components/PDF';
import EditTimestampTime from '../../components/Forms/EditTimestampTime';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Icons
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import GetAppIcon from '@mui/icons-material/GetApp';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddTimestampTime from '../../components/Forms/AddTimestampTime';
import TimeStampExcel from '../../components/Excel/TimeStampExcel';
import Loading from 'components/Loading';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 450 },
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 3,
};

export default function HrTimestampList({ title, subtitle }) {
  const theme = useTheme();
  const history = useHistory();
  const dispatch = useDispatch();

  const timestamp = useSelector((state) => state.timestamp);
  const employees = useSelector((state) => state.employee);
  const info = useSelector((state) => state.info);
  const projects = useSelector((state) => state.project);
  const me = useSelector((state) => state.me);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(9);
  const [emSelect, setEmSelect] = useState();
  const [dateStart, setDateStart] = useState(dayjs());
  const [dateEnd, setDateEnd] = useState(dayjs());
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(dayjs());
  const [checkin, setCheckin] = useState();
  const [openEditCheckin, setOpenCheckin] = useState(false);
  const [valueCheckIn, setValueCheckin] = useState(dayjs());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [openAddTimestamp, setOpenAddTimestamp] = useState(false);
  const [projectSelect, setProjectSelect] = useState();
  const [employeeSelect, setEmployeeSelect] = useState();

  const fetchData = () => {
    setIsRefreshing(true);
    dispatch(
      actions.timestampAll({
        emSelect,
        dateStart: dayjs(dateStart).startOf('day').toISOString(),
        dateEnd: dayjs(dateEnd).endOf('day').toISOString(),
      }),
    ).then(() => {
      setIsRefreshing(false);
    });
  };

  useEffect(() => {
    dispatch(actions.timestampReset());
    fetchData();
    dispatch(actions.employeeAll({}));
    dispatch(actions.getInformation());
    dispatch(actions.projectAll({}));

    return () => {};
  }, [page, size, emSelect, dateStart, dateEnd]);

  // Socket.IO real-time listeners
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchData();

    socket.on('timestamp:created', refresh);
    socket.on('timestamp:updated', refresh);
    socket.on('timestamp:deleted', refresh);

    return () => {
      socket.off('timestamp:created', refresh);
      socket.off('timestamp:updated', refresh);
      socket.off('timestamp:deleted', refresh);
    };
  }, [socket, emSelect, dateStart, dateEnd]);

  const handleCheckout = async () => {
    const confirm = window.confirm('ยืนยันการบันทึกเวลาออก?');
    if (confirm) {
      const datasubmit = {
        ...checkin,
        checkOut: value.toISOString(),
        status_checkOut: true,
      };
      await dispatch(actions.timestampOtRequire(checkin?.id, { datasubmit }));
      fetchData();
      setOpen(false);
    }
  };

  const handleCheckin = async () => {
    const confirm = window.confirm('ยืนยันการบันทึกเวลาเข้า?');
    if (confirm) {
      const datasubmit = {
        ...checkin,
        checkIn: valueCheckIn.toISOString(),
        project_in: projectSelect,
      };
      await dispatch(actions.timestampOtRequire(checkin?.id, { datasubmit }));
      fetchData();
      setOpenCheckin(false);
    }
  };
  const onAddTimestamp = async () => {
    if (!projectSelect) {
      alert('Please select a project');
    } else {
      const confirm = window.confirm('save');
      if (confirm) {
        const data = {
          employee: employeeSelect?._id,
          employee_firstname: employeeSelect?.firstname,
          employee_lastname: employeeSelect?.lastname,
          employeeType: employeeSelect?.type,
          checkIn: value.toISOString(),
          salary: employeeSelect?.salary,
          salary_extra: employeeSelect?.salary_extra,
          status_checkIn: true,
          project_in: projectSelect,
          employeekey: employeeSelect?.check_key,
          note: `Check in by ${me?.userData?.firstname} ${me?.userData?.lastname}`,
        };
        await dispatch(actions.timestampHrCheckin(data));
        fetchData();
        setEmployeeSelect();
        setProjectSelect();
        setOpenAddTimestamp(false);
      }
    }
  };

  const handleOpen = (each) => {
    setOpen(true);
    setCheckin(each);
  };

  const handleOpenEditCheckin = (each) => {
    setProjectSelect(each?.project_in);
    setOpenCheckin(true);
    setCheckin(each);
  };

  const handleClose = () => setOpen(false);
  const handleCloseEditCheckin = () => setOpenCheckin(false);

  const renderDelete = async (id) => {
    const confirm = window.confirm('ยืนยันการลบข้อมูล?');
    if (confirm) {
      await dispatch(actions.timestampDelete(id));
      fetchData();
    }
  };

  const handlePrint = () => {
    timestampReport(timestamp);
  };

  const openFiltersMenu = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const closeFiltersMenu = () => {
    setFilterAnchorEl(null);
  };

  const clearFilters = () => {
    setEmSelect(undefined);
    closeFiltersMenu();
  };

  const openDateRangePicker = (event) => {
    setDateAnchorEl(event.currentTarget);
    setDateRangeOpen(true);
  };

  const closeDateRangePicker = () => {
    setDateAnchorEl(null);
    setDateRangeOpen(false);
  };

  const handleAddTimestamp = () => {
    setOpenAddTimestamp(true);
    // Logic to add a new timestamp
  };

  const handleExport = () => {
    const { exportToExcel } = TimeStampExcel({
      data: timestamp?.rows || [],
      fileName: 'timestamp_report',
    });
    exportToExcel();
  };

  const handleUpdateRate = async (row, rate) => {
    const datasubmit = {
      ...row,
      rate: rate,
    };
    console.log('data', datasubmit);

    await dispatch(actions.timestampPut(row?._id, datasubmit));
    fetchData();
  };

  // คำนวณข้อมูลสรุป
  const totalCheckins = timestamp?.rows?.length || 0;
  const uniqueEmployees = new Set(
    timestamp?.rows?.map((ts) => ts?.employee?._id),
  ).size;
  const avgHoursPerDay =
    timestamp?.rows?.reduce((sum, ts) => {
      if (ts?.checkIn && ts?.checkOut) {
        const checkInTime = new Date(ts.checkIn);
        const checkOutTime = new Date(ts.checkOut);
        const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        return sum + hoursWorked;
      }
      return sum;
    }, 0) / (totalCheckins || 1);

  // ข้อมูลสรุปตามสถานะ
  const completeCheckins =
    timestamp?.rows?.filter((ts) => ts?.status_checkIn && ts?.status_checkOut)
      ?.length || 0;
  const incompleteCheckins =
    timestamp?.rows?.filter((ts) => ts?.status_checkIn && !ts?.status_checkOut)
      ?.length || 0;

  // ส่วนหัวแบบ Compact ด้วย Flexbox
  const renderCompactHeader = () => (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {/* ด้านซ้าย - ตัวเลือกวันที่และตัวกรอง */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={openDateRangePicker}
          startIcon={<DateRangeIcon />}
          sx={{ height: 40 }}
        >
          {dayjs(dateStart).format('DD MMM YYYY') ===
          dayjs(dateEnd).format('DD MMM YYYY')
            ? dayjs(dateStart).format('DD MMM YYYY')
            : `${dayjs(dateStart).format('DD MMM')} - ${dayjs(dateEnd).format(
                'DD MMM',
              )}`}
        </Button>

        {emSelect && (
          <Chip
            icon={<PeopleIcon fontSize="small" />}
            label={`${emSelect.firstname} ${emSelect.lastname}`}
            size="small"
            onDelete={() => setEmSelect(undefined)}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* ด้านขวา - ปุ่มการทำงาน */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="แสดง/ซ่อนสรุปข้อมูล">
          <IconButton
            size="small"
            onClick={() => setShowStats(!showStats)}
            color={showStats ? 'primary' : 'default'}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button
          size="small"
          variant="outlined"
          onClick={openFiltersMenu}
          startIcon={<FilterAltIcon />}
          sx={{ height: 40 }}
        >
          กรองข้อมูล
        </Button>

        <Button
          variant="contained"
          size="small"
          onClick={handleAddTimestamp}
          startIcon={<AddIcon />}
          sx={{ height: 40 }}
        >
          เพิ่มรายการลงเวลา
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="small"
          onClick={handleExport}
          startIcon={<GetAppIcon />}
          sx={{ height: 40 }}
        >
          export excel
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={handlePrint}
          startIcon={<PrintIcon />}
          sx={{ height: 40 }}
        >
          พิมพ์รายงาน
        </Button>
      </Stack>

      {/* Date Range Picker Popover */}
      <Popover
        open={dateRangeOpen}
        anchorEl={dateAnchorEl}
        onClose={closeDateRangePicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            เลือกช่วงวันที่
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={2} sx={{ mt: 1, mb: 2 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  วันที่เริ่มต้น
                </Typography>
                <DatePicker
                  value={dateStart}
                  onChange={(newDate) => setDateStart(newDate)}
                  renderInput={(props) => (
                    <TextField {...props} fullWidth size="small" />
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  วันที่สิ้นสุด
                </Typography>
                <DatePicker
                  value={dateEnd}
                  onChange={(newDate) => setDateEnd(newDate)}
                  renderInput={(props) => (
                    <TextField {...props} fullWidth size="small" />
                  )}
                />
              </Box>
            </Stack>
          </LocalizationProvider>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              size="small"
              onClick={() => {
                setDateStart(dayjs());
                setDateEnd(dayjs());
                closeDateRangePicker();
              }}
            >
              วันนี้
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={closeDateRangePicker}
            >
              ตกลง
            </Button>
          </Box>
        </Paper>
      </Popover>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={closeFiltersMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            กรองข้อมูลตามพนักงาน
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            value={emSelect?._id || ''}
            onChange={(e) =>
              setEmSelect(
                e.target.value
                  ? employees?.rows?.find((em) => em._id === e.target.value)
                  : undefined,
              )
            }
            margin="dense"
            label="เลือกพนักงาน"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PeopleIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            {employees?.rows?.map((employee) => (
              <MenuItem key={employee._id} value={employee._id}>
                {employee.firstname} {employee.lastname}
              </MenuItem>
            ))}
          </TextField>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ mt: 2 }}
          >
            {emSelect && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
              >
                ล้างตัวกรอง
              </Button>
            )}
            <Button size="small" variant="contained" onClick={closeFiltersMenu}>
              ตกลง
            </Button>
          </Stack>
        </Paper>
      </Popover>
    </Box>
  );

  // สรุปข้อมูลแบบมินิมอลด้วย Flexbox
  const renderMinimalStats = () => (
    <Collapse in={showStats}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        {/* การลงเวลาทั้งหมด */}
        <Box
          sx={{
            flex: '1 0 200px',
            minWidth: '180px',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
            }}
          >
            <EventIcon color="primary" fontSize="small" />
          </Box>

          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              การลงเวลาทั้งหมด
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {totalCheckins} รายการ
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Chip
                size="small"
                label={`ครบถ้วน ${completeCheckins}`}
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'success.main',
                }}
              />
              <Chip
                size="small"
                label={`ไม่ครบ ${incompleteCheckins}`}
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.main',
                }}
              />
            </Stack>
          </Stack>
        </Box>

        {/* จำนวนพนักงาน */}
        <Box
          sx={{
            flex: '1 0 200px',
            minWidth: '180px',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.success.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
            }}
          >
            <PeopleIcon color="success" fontSize="small" />
          </Box>

          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              จำนวนพนักงาน
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {uniqueEmployees} คน
            </Typography>
            <Typography variant="caption" color="text.secondary">
              จากการลงเวลาในช่วงวันที่เลือก
            </Typography>
          </Stack>
        </Box>

        {/* เวลาเฉลี่ย */}
        <Box
          sx={{
            flex: '1 0 200px',
            minWidth: '180px',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.info.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
            }}
          >
            <QueryBuilderIcon color="info" fontSize="small" />
          </Box>

          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              เฉลี่ยชั่วโมงทำงาน/วัน
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {avgHoursPerDay.toFixed(2)} ชั่วโมง
            </Typography>
            <Typography variant="caption" color="text.secondary">
              คำนวณจากรายการที่มีเวลาเข้า-ออก
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Collapse>
  );

  const renderModalAddTimestamp = () => (
    <Modal
      open={openAddTimestamp}
      onClose={() => setOpenAddTimestamp(false)}
      aria-labelledby="add-timestamp-title"
      closeAfterTransition
    >
      <Fade in={openAddTimestamp}>
        <Box sx={modalStyle}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography
              variant="h6"
              id="add-timestamp-title"
              sx={{ fontWeight: 'bold' }}
            >
              เพิ่มรายการลงเวลา
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpenAddTimestamp(false)}
              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Box>
            <AddTimestampTime
              projectSelect={projectSelect}
              setProjectSelect={setProjectSelect}
              projects={projects}
              value={value}
              setValue={setValue}
              employees={employees}
              employeeSelect={employeeSelect}
              setEmployeeSelect={setEmployeeSelect}
            />
          </Box>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ mt: 3 }}
          >
            <Button
              variant="contained"
              onClick={onAddTimestamp}
              startIcon={<SaveIcon />}
            >
              บันทึก
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );

  // โมดัลแก้ไขเวลาเข้างาน
  const renderModalCheckin = () => (
    <Modal
      open={openEditCheckin}
      onClose={handleCloseEditCheckin}
      aria-labelledby="edit-checkin-title"
      closeAfterTransition
    >
      <Fade in={openEditCheckin}>
        <Box sx={modalStyle}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography
              variant="h6"
              id="edit-checkin-title"
              sx={{ fontWeight: 'bold' }}
            >
              แก้ไขเวลาเข้างาน
            </Typography>
            <IconButton
              size="small"
              onClick={handleCloseEditCheckin}
              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {checkin && (
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                พนักงาน: {checkin?.employee?.firstname}{' '}
                {checkin?.employee?.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                วันที่: {dayjs(checkin?.checkIn).format('DD/MM/YYYY')}
              </Typography>
            </Stack>
          )}

          <Box sx={{ py: 2 }}>
            <EditTimestampTime
              value={valueCheckIn}
              setValue={setValueCheckin}
              projects={projects}
              projectSelect={projectSelect}
              setProjectSelect={setProjectSelect}
            />
          </Box>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ mt: 3 }}
          >
            <Button variant="outlined" onClick={handleCloseEditCheckin}>
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              onClick={handleCheckin}
              startIcon={<SaveIcon />}
            >
              บันทึก
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );

  const renderModalCheckout = () => (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="edit-checkout-title"
      closeAfterTransition
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              id="edit-checkout-title"
              sx={{ fontWeight: 'bold' }}
            >
              แก้ไขเวลาออกงาน
            </Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {checkin && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                พนักงาน: {checkin?.employee?.firstname}{' '}
                {checkin?.employee?.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                วันที่: {dayjs(checkin?.checkIn).format('DD/MM/YYYY')}
              </Typography>
            </Box>
          )}

          <Box sx={{ py: 2 }}>
            <EditTimestampTime
              value={value}
              setValue={setValue}
              checkout={false}
            />
          </Box>

          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}
          >
            <Button variant="outlined" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              onClick={handleCheckout}
              startIcon={<SaveIcon />}
            >
              บันทึก
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );

  const renderTable = () => {
    if (timestamp.isLoading || timestamp.isCompleted === false) {
      return <Loading isLoading />;
    }
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <HrcheckinList
          timestamp={timestamp}
          page={page}
          size={size}
          setPage={setPage}
          setSize={setSize}
          show={info?.setting?.timestamp_image}
          renderDelete={renderDelete}
          handleOpen={handleOpen}
          handleOpenEditCheckin={handleOpenEditCheckin}
          handleUpdateRate={handleUpdateRate}
        />
      </Paper>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>

      {renderCompactHeader()}
      {renderMinimalStats()}
      {renderTable()}
      {renderModalCheckout()}
      {renderModalCheckin()}
      {renderModalAddTimestamp()}
    </Container>
  );
}
