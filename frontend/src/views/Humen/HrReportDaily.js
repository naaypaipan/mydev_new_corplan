import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import dayjs from 'dayjs';
import _, { times } from 'lodash';

// Material UI
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Divider,
  Stack,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  Container,
  useTheme,
  alpha,
  Fade,
  Collapse,
  Popover,
  Tooltip,
  Modal,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  FormControl,
} from '@mui/material';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline';
import TodayIcon from '@mui/icons-material/Today';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';

// Components

import HrDashboardCard from '../../components/Card/HrDashboardCard';
import HrcheckinListReportDailyByproject from '../../components/Table/HrcheckinListReportDailyByproject';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Loading } from '../../components/Loading';
import EditOtForm from 'components/Forms/EditOtForm';

// PDF Generation
import {
  timestampCheckinReport,
  timestampDailyReport,
  timestampDailySalaryReport,
  timestampDailyAllProjectReport,
  timestampDailySalaryAllProjectReport,
} from '../../components/PDF';
import AddTimestampTime from '../../components/Forms/AddTimestampTime';
import EditTimestampTime from '../../components/Forms/EditTimestampTime';
import EditTimestampTimeWithRate from '../../components/Forms/EditTimestampTimeWithRate';

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

export default function HrReportDaily({ title, subtitle }) {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Selectors
  const timestamp = useSelector((state) => state.timestamp);
  const employees = useSelector((state) => state.employee);
  const project = useSelector((state) => state.project);
  const roletype = useSelector((state) => state.roletype);
  const me = useSelector((state) => state.me);

  const am = me?.userData;
  const isAdmin = !!am?.permissions?.admin;

  // States
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [emSelect, setEmSelect] = useState();
  const [projectSelect, setProjectSelect] = useState();
  const [dateStart, setDateStart] = useState(dayjs());
  const [dateEnd, setDateEnd] = useState(new Date());
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [roleSelect, setRoleSelect] = useState();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [reportTypeAnchorEl, setReportTypeAnchorEl] = useState(null);
  const [printMenuAnchorEl, setPrintMenuAnchorEl] = useState(null);
  const [openEditTimestamp, setOpenEditTimestamp] = useState(false);
  const [editTimestamp, setEditTimestamp] = useState(null);
  const [dateIn, setDateIn] = useState(null);
  const [dateOut, setDateOut] = useState(null);
  const [employeeSelect, setEmployeeSelect] = useState(null);
  const [openAddTimestamp, setOpenAddTimestamp] = useState(false);
  const [rate, setRate] = useState(0);
  const [allowance, setAllowance] = useState();
  const [openPersonModal, setOpenPersonModal] = useState(false);
  const [formData, setFormData] = useState({
    startTime: null,
    endTime: null,
    totalHours: 0,
    rate: 1.5,
    totalPrice: 0,
    description: '',
    data_id: '',
  });
  const [typeSelect, setTypeSelect] = useState('');

  const reportTypes = [
    {
      id: 0,
      label: 'Without Salary',
      icon: <DescriptionIcon />,
      color: 'success',
      permission: true,
    },
    {
      id: 1,
      label: 'With Salary',
      icon: <AttachMoneyIcon />,
      color: 'secondary',
      permission: isAdmin,
    },
    // {
    //   id: 2,
    //   label: 'Checkin',
    //   icon: <TimelineIcon />,
    //   color: 'info',
    //   permission: am?.permissions?.hr_management || false,
    // },
  ];

  const visibleReportTypes = reportTypes.filter((t) => t.permission);
  const activeReportMeta =
    visibleReportTypes.find((t) => t.id === selectedIndex) ||
    visibleReportTypes[0] ||
    reportTypes[0];

  // Computed states
  const groupProject = _?.groupBy(timestamp?.rows, 'projectDetails._id');
  const activeFiltersCount = [emSelect, projectSelect, roleSelect].filter(
    Boolean,
  ).length;
  const formattedDate = dayjs(dateStart).format('DD MMM YYYY');

  const fetchData = () => {
    dispatch(
      actions.timestampDaily({
        dateStart: dayjs(dateStart).startOf('day').toISOString(),
        dateEnd: dayjs(dateStart).endOf('day').toISOString(),
        typeSelect: typeSelect,
      }),
    );
  };

  // Load data
  useEffect(() => {
    dispatch(actions.timestampReset());
    fetchData();
    return () => {};
  }, [
    page,
    size,
    emSelect,
    dateStart,
    dateEnd,
    roleSelect,
    selectedIndex,
    typeSelect,
  ]);

  // Load initial data
  useEffect(() => {
    dispatch(actions.projectAll({}));
    dispatch(actions.employeeAll({}));
    dispatch(actions.getInformation());
    dispatch(actions.roletypeAll({}));
    return () => {};
  }, []);

  useEffect(() => {
    if (!isAdmin && selectedIndex === 1) {
      setSelectedIndex(0);
    }
  }, [isAdmin, selectedIndex]);

  // Handlers
  const handlePrint = () => {
    const data = { ...timestamp, project: projectSelect, date: dateStart };
    timestampDailyAllProjectReport(data);
    setPrintMenuAnchorEl(null);
  };

  const handlePrintWithSalary = () => {
    const data = { ...timestamp, project: projectSelect, date: dateStart };
    timestampDailySalaryAllProjectReport(data);
    setPrintMenuAnchorEl(null);
  };

  const handlePrintCheckin = () => {
    const data = { ...timestamp, project: projectSelect, date: dateStart };
    timestampCheckinReport(data);
    setPrintMenuAnchorEl(null);
  };

  const handleOpenPersonModal = () => setOpenPersonModal(true);
  const handleClosePersonModal = () => setOpenPersonModal(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // คำนวณชั่วโมงและราคาใหม่เมื่อเปลี่ยนเวลา
    if (field === 'startTime' || field === 'endTime') {
      const start = field === 'startTime' ? value : formData.startTime;
      const end = field === 'endTime' ? value : formData.endTime;

      if (start && end) {
        const hours = end.diff(start, 'hour', true);
        const price = hours * (formData?.salary?.hr || 0) * formData.rate;

        setFormData((prev) => ({
          ...prev,
          totalHours: hours.toFixed(2),
          totalPrice: price,
        }));
      }
    }

    // คำนวณราคาใหม่เมื่อเปลี่ยน rate
    if (field === 'rate') {
      const price = formData.totalHours * (formData?.salary?.hr || 0) * value;
      setFormData((prev) => ({
        ...prev,
        totalPrice: price,
      }));
    }
  };

  const handleEdit = (data) => {
    setFormData({
      startTime: data?.startTime ? dayjs(data.startTime) : null,
      endTime: data?.endTime ? dayjs(data.endTime) : null,
      totalHours: data?.total_hours || 0,
      rate: data?.rate || 1.5,
      totalPrice: data?.total_price || 0,
      description: data?.description || '',
      data_id: data?._id || '',
      salary: data?.salary || {},
    });
    setRate(data?.rate || 1.5);
    handleOpenPersonModal();
  };

  const handleSubmitEditPerson = async () => {
    const data = {
      startTime: formData.startTime?.toISOString(),
      endTime: formData.endTime?.toISOString(),
      total_hours: formData.totalHours,
      rate: formData.rate,
      total_price: formData.totalPrice,
      description: formData.description,
    };

    await dispatch(actions.otRequestPut(formData?.data_id, data));
    fetchData();
    handleClosePersonModal();
  };

  const renderEditPersonModal = () => (
    <Modal
      open={openPersonModal}
      onClose={handleClosePersonModal}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={openPersonModal}>
        <Card
          sx={{
            width: { xs: '95%', sm: '90%', md: 600 },
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                แก้ไขข้อมูลรายบุคคล OT
              </Typography>
              <IconButton
                onClick={handleClosePersonModal}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ p: 3 }}>
              <EditOtForm
                formData={formData}
                handleChange={handleChange}
                handleCloseModal={handleClosePersonModal}
                handleSubmit={handleSubmitEditPerson}
              />
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Modal>
  );

  const handlePrintReport = () => {
    if (selectedIndex === 1 && isAdmin) {
      handlePrintWithSalary();
    } else if (selectedIndex === 0) {
      handlePrint();
    } else if (selectedIndex === 2) {
      handlePrintCheckin();
    } else {
      handlePrint();
    }
  };

  const goToPreviousDay = () => {
    const newDate = dayjs(dateStart).subtract(1, 'day');
    setDateStart(newDate);
  };

  const goToNextDay = () => {
    const newDate = dayjs(dateStart).add(1, 'day');
    setDateStart(newDate);
  };

  const clearFilters = () => {
    setEmSelect(undefined);
    setProjectSelect(undefined);
    setRoleSelect(undefined);
    setFilterAnchorEl(null);
  };

  const openFiltersMenu = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const closeFiltersMenu = () => {
    setFilterAnchorEl(null);
  };

  const openDatePicker = (event) => {
    setDateAnchorEl(event.currentTarget);
    setDatePickerOpen(true);
  };

  const closeDatePicker = () => {
    setDateAnchorEl(null);
    setDatePickerOpen(false);
  };

  const openReportTypeMenu = (event) => {
    setReportTypeAnchorEl(event.currentTarget);
  };

  const closeReportTypeMenu = () => {
    setReportTypeAnchorEl(null);
  };

  const openPrintMenu = (event) => {
    setPrintMenuAnchorEl(event.currentTarget);
  };

  const closePrintMenu = () => {
    setPrintMenuAnchorEl(null);
  };

  const handleEditTimestamp = (eachProject, data) => {
    setDateIn(dayjs(data?.checkIn));
    setEditTimestamp(data || null);
    const each = _.find(project.rows, { _id: eachProject?.project_id });
    setProjectSelect(each);
    setRate(data?.rate || 0);
    setAllowance(data?.allowance);
    setOpenEditTimestamp(true);
  };

  const handleCheckin = async () => {
    const confirm = window.confirm('ยืนยันการบันทึกเวลาเข้า?');
    if (confirm) {
      const datasubmit = {
        checkIn: dateIn.toISOString(),
        project_in: projectSelect,
        rate,
        salary_extra: { day: allowance },
      };
      await dispatch(
        actions.timestampOtRequire(editTimestamp?.timestamp_id, { datasubmit }),
      );
      fetchData();
      setOpenEditTimestamp(false);
    }
  };

  const renderModalEditTimestamp = () => (
    <Modal
      open={openEditTimestamp}
      onClose={() => setOpenEditTimestamp(false)}
      aria-labelledby="add-timestamp-title"
      closeAfterTransition
    >
      <Fade in={openEditTimestamp}>
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
              แก้ไขรายการลงเวลา
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpenEditTimestamp(false)}
              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="body2">
              พนักงาน: {editTimestamp?.name}
            </Typography>
            <Typography variant="body2">
              แผนก : {editTimestamp?.role}
            </Typography>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Box>
            <EditTimestampTimeWithRate
              projectSelect={projectSelect}
              setProjectSelect={setProjectSelect}
              projects={project}
              value={dateIn}
              setValue={setDateIn}
              rate={rate}
              setRate={setRate}
              allowance={allowance}
              setAllowance={setAllowance}
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

  const onAddTimestamp = async () => {
    if (!projectSelect) {
      alert('Please select a project');
      return;
    }
    if (!dateIn && !dateOut) {
      alert('Please select at least check-in or check-out time');
      return;
    }
    const confirm = window.confirm('save');
    if (confirm) {
      const data = {
        employee: employeeSelect?._id,
        employee_firstname: employeeSelect?.firstname,
        employee_lastname: employeeSelect?.lastname,
        employeeType: employeeSelect?.type,
        checkIn: dateIn ? dateIn.toISOString() : undefined,
        checkOut: dateOut ? dateOut.toISOString() : undefined,
        salary: employeeSelect?.salary,
        salary_extra: employeeSelect?.salary_extra,
        status_checkIn: !!dateIn,
        status_checkOut: !!dateOut,
        project_in: projectSelect,
        employeekey: employeeSelect?.check_key,
        note: `Check in/out by ${me?.userData?.firstname} ${me?.userData?.lastname}`,
      };
      await dispatch(actions.timestampHrCheckin(data));
      fetchData();
      setEmployeeSelect();
      setProjectSelect();
      setDateIn(null);
      setDateOut(null);
      setOpenAddTimestamp(false);
    }
  };

  const handleAddTimestamp = () => {
    setOpenAddTimestamp(true);
  };

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
              projects={project}
              checkInValue={dateIn}
              setCheckInValue={setDateIn}
              checkOutValue={dateOut}
              setCheckOutValue={setDateOut}
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

  const handleNotifyHr = () => {
    const confirm = window.confirm('Are you sure to send notification to HR?');
    if (confirm) {
      dispatch(
        actions.requestNotifyCheckinDaily({
          date: dayjs(dateStart).format('YYYY-MM-DD'),
        }),
      );
    }
  };

  const renderCompactHeader = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Tooltip title="Previous day">
            <IconButton
              size="small"
              onClick={goToPreviousDay}
              sx={{ borderRadius: 0 }}
            >
              <NavigateBeforeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Select date">
            <Button
              size="small"
              onClick={openDatePicker}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 0,
                border: 'none',
                borderLeft: '1px solid',
                borderRight: '1px solid',
                borderColor: 'divider',
              }}
              startIcon={<CalendarTodayIcon fontSize="small" />}
            >
              {formattedDate}
            </Button>
          </Tooltip>

          <Tooltip title="Next day">
            <IconButton
              size="small"
              onClick={goToNextDay}
              sx={{ borderRadius: 0 }}
            >
              <NavigateNextIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box>
          <FormControl required fullWidth size="small">
            <Select
              onChange={(event) => setTypeSelect(event.target.value)}
              value={typeSelect}
              displayEmpty
              size="small"
              sx={{
                borderRadius: 1.5,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <MenuItem value="FULLTIME">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonIcon
                    fontSize="small"
                    sx={{ color: theme.palette.info.main }}
                  />
                  <Typography>พนักงานประจำ</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="DAILY">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonIcon
                    fontSize="small"
                    sx={{ color: theme.palette.warning.main }}
                  />
                  <Typography>พนักงานรายวัน</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonIcon
                    fontSize="small"
                    sx={{ color: theme.palette.warning.main }}
                  />
                  <Typography>ทั้งหมด</Typography>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ToggleButtonGroup
          value={selectedIndex}
          exclusive
          size="small"
          onChange={(e, value) => value !== null && setSelectedIndex(value)}
        >
          {reportTypes.map(
            (type) =>
              type.permission && (
                <ToggleButton
                  key={type.id}
                  value={type.id}
                  color={type.color}
                  sx={{ px: 1, py: 0.5 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {React.cloneElement(type.icon, { fontSize: 'small' })}
                    <Typography
                      variant="body2"
                      sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                      {type.label}
                    </Typography>
                  </Box>
                </ToggleButton>
              ),
          )}
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleNotifyHr}
          sx={{ ml: 0 }}
        >
          Notify HR
        </Button>

        <div>
          <Button
            size="small"
            onClick={handleAddTimestamp}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Timestamp
          </Button>
        </div>

        <Tooltip title="Print report">
          <Button
            size="small"
            variant="contained"
            color={activeReportMeta.color}
            onClick={handlePrintReport}
            startIcon={<PrintIcon />}
            sx={{ py: 0.5 }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Print</Box>
          </Button>
        </Tooltip>
      </Box>

      <Popover
        open={datePickerOpen}
        anchorEl={dateAnchorEl}
        onClose={closeDatePicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, width: 300 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dateStart}
              onChange={(newDate) => {
                setDateStart(newDate);
                closeDatePicker();
              }}
              renderInput={(props) => (
                <TextField {...props} fullWidth size="small" />
              )}
            />
          </LocalizationProvider>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              size="small"
              startIcon={<TodayIcon />}
              onClick={() => {
                setDateStart(dayjs());
                closeDatePicker();
              }}
            >
              Today
            </Button>
            <Button size="small" onClick={closeDatePicker}>
              Close
            </Button>
          </Box>
        </Paper>
      </Popover>

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={closeFiltersMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter Report
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <TextField
              select
              label="Employee"
              size="small"
              fullWidth
              value={emSelect?._id || ''}
              onChange={(e) =>
                setEmSelect(
                  e.target.value
                    ? employees?.rows?.find((em) => em._id === e.target.value)
                    : undefined,
                )
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PeopleIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">All Employees</MenuItem>
              {employees?.rows?.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.firstname} {employee.lastname}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Project"
              size="small"
              fullWidth
              value={projectSelect?._id || ''}
              onChange={(e) =>
                setProjectSelect(
                  e.target.value
                    ? project?.rows?.find((p) => p._id === e.target.value)
                    : undefined,
                )
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">All Projects</MenuItem>
              {project?.rows?.map((proj) => (
                <MenuItem key={proj._id} value={proj._id}>
                  {proj.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Role"
              size="small"
              fullWidth
              value={roleSelect?._id || ''}
              onChange={(e) =>
                setRoleSelect(
                  e.target.value
                    ? roletype?.rows?.find(
                        (role) => role._id === e.target.value,
                      )
                    : undefined,
                )
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">All Roles</MenuItem>
              {roletype?.rows?.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}
          >
            {activeFiltersCount > 0 && (
              <Button
                size="small"
                startIcon={<FilterAltOffIcon />}
                onClick={clearFilters}
                color="inherit"
              >
                Clear All
              </Button>
            )}
            <Button size="small" variant="contained" onClick={closeFiltersMenu}>
              Apply
            </Button>
          </Box>
        </Paper>
      </Popover>
    </Box>
  );

  const renderTable = () => {
    if (selectedIndex === 2) {
      return (
        <Fade in={true} timeout={300}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.info.light, 0.05),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="subtitle1" fontWeight={500}>
                <TimelineIcon
                  sx={{ mr: 1, fontSize: 18, verticalAlign: 'text-bottom' }}
                />
                Check-in Report: {formattedDate}
              </Typography>

              {activeFiltersCount > 0 && (
                <Chip
                  size="small"
                  label={`${activeFiltersCount} filters`}
                  onDelete={clearFilters}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>

            <Box sx={{ p: 2 }}>
              <HrDashboardCard timestamp={timestamp} />
            </Box>
          </Card>
        </Fade>
      );
    }

    return (
      <Stack spacing={2}>
        {timestamp?.rows?.length > 0 ? (
          timestamp.rows.map((row, index) => (
            <Fade key={index} in={true} timeout={200 + index * 50}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha(
                      theme.palette[activeReportMeta.color].light,
                      0.05,
                    ),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {row.project_number || 'Unnamed Project'} |{' '}
                    {row.project_customer || 'Unnamed Customer'} |{' '}
                    {row.project_location || 'Unnamed Location'}
                    <div className="text-xs">
                      {row.project_name || 'No Project Name'}
                    </div>
                  </div>
                  <Chip
                    label={`${row?.employees?.length || 0} people`}
                    color={activeReportMeta.color}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <HrcheckinListReportDailyByproject
                  timestamp={row}
                  showSalary={isAdmin && selectedIndex === 1}
                  handleEditTimestamp={handleEditTimestamp}
                  handleEdit={handleEdit}
                />
              </Card>
            </Fade>
          ))
        ) : (
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No data found for {formattedDate}
            </Typography>
          </Card>
        )}
      </Stack>
    );
  };

  if (!timestamp?.isLoading && timestamp?.isCompleted) {
    return (
      <div>
        {renderModalEditTimestamp()}
        {renderCompactHeader()}
        {renderModalAddTimestamp()}
        {renderTable()}
        {renderEditPersonModal()}
      </div>
    );
  } else return <Loading isLoading />;
}
