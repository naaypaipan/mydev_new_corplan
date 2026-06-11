import React, { useEffect, useState } from 'react';

import * as actions from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import FilterTimestampReportCard from '../../components/Card/FilterTimestampReportCard';
import _ from 'lodash';
import {
  timestampReportPersonal,
  timeStampMontlyReport,
} from '../../components/PDF';
import Monthlyreport from '../../components/Card/Monthlyreport';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';

// Material-UI
import {
  Box,
  Card,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  alpha,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  InputAdornment,
  Collapse,
  Badge,
  Tab,
  Tabs,
  Menu,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import TodayIcon from '@mui/icons-material/Today';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupIcon from '@mui/icons-material/Group';
import Loading from 'components/Loading';
import TimestampProjectCost from '../../components/Table/TimestampProjectCost';

dayjs.extend(weekday);
dayjs.extend(localeData);

export default function HrReport({ title, subtitle }) {
  const theme = useTheme();
  const history = useHistory();
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employee);
  const timestamp = useSelector((state) => state.timestamp);
  const roletype = useSelector((state) => state.roletype);
  const project = useSelector((state) => state.project);
  const me = useSelector((state) => state.me);
  const info = useSelector((state) => state.info);

  const [name, setName] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(9999);
  const [emSelect, setEmSelect] = useState();
  const [dateStart, setDateStart] = useState(dayjs().startOf('month'));
  const [dateEnd, setDateEnd] = useState(dayjs().endOf('month'));
  const [month, setMonth] = useState(dayjs().month());
  const [year, setYear] = useState(dayjs().year());
  const [roleSelect, setRoleSelect] = useState();
  const [projectSelect, setProjectSelect] = useState();
  const [selectedOption, setSelectedOption] = useState('Month');
  const [countDay, setCountDay] = useState(
    dayjs(`${year}-${month + 1}`).daysInMonth(),
  );
  const [startDay, setStartDay] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [typeSelect, setTypeSelect] = useState('DAILY');

  const daysInMonth = dayjs(`${year}-${month + 1}`).daysInMonth();
  const midDay = Math.ceil(daysInMonth / 2);
  const days = Array.from({ length: countDay }, (_, i) => i + startDay);
  const monthNames = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];

  useEffect(() => {
    // สร้าง dateStart และ dateEnd เป็น ISO string ที่ถูกต้อง
    let start, end;
    if (selectedOption === 'Month') {
      start = dayjs()
        .year(year)
        .month(month)
        .startOf('month')
        .format('YYYY-MM-DDT00:00:00.000[Z]');
      end = dayjs()
        .year(year)
        .month(month)
        .endOf('month')
        .format('YYYY-MM-DDT23:59:59.999[Z]');
      setCountDay(dayjs(`${year}-${month + 1}`).daysInMonth());
      setStartDay(1);
    } else if (selectedOption === '15') {
      start = dayjs()
        .year(year)
        .month(month)
        .startOf('month')
        .format('YYYY-MM-DDT00:00:00.000[Z]');
      end = dayjs()
        .year(year)
        .month(month)
        .date(15)
        .endOf('day')
        .format('YYYY-MM-DDT23:59:59.999[Z]');
      setCountDay(15);
      setStartDay(1);
    } else if (selectedOption === '31') {
      start = dayjs()
        .year(year)
        .month(month)
        .date(16)
        .startOf('day')
        .format('YYYY-MM-DDT00:00:00.000[Z]');
      end = dayjs()
        .year(year)
        .month(month)
        .endOf('month')
        .format('YYYY-MM-DDT23:59:59.999[Z]');
      setCountDay(dayjs(`${year}-${month + 1}`).daysInMonth() - 15);
      setStartDay(16);
    }
    setDateStart(start);
    setDateEnd(end);

    dispatch(
      actions.timestampPayrollDashboard({
        dateStart: start,
        dateEnd: end,
        typeSelect,
        project_id: projectSelect?._id,
      }),
    );
    // eslint-disable-next-line
  }, [
    emSelect,
    month,
    year,
    roleSelect,
    projectSelect,
    selectedOption,
    typeSelect,
  ]);

  useEffect(() => {
    dispatch(actions.employeeAll({}));
    dispatch(actions.roletypeAll({}));
    dispatch(actions.projectAll({}));
    dispatch(actions.getInformation({}));
    // eslint-disable-next-line
  }, []);

  const handlePrint = () => {
    timeStampMontlyReport(info, timestamp, days, month, year, dateStart);
  };

  const handleValueChange = (event) => {
    const count = event.target.value;
    setSelectedOption(count);
    // dateStart/dateEnd จะถูก set ใน useEffect ด้านบน
  };

  const clearFilters = () => {
    setEmSelect(undefined);
    setProjectSelect(undefined);
    setRoleSelect(undefined);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleChangeMonth = (event) => {
    setMonth(parseInt(event.target.value));
  };

  const handleChangeYear = (event) => {
    setYear(parseInt(event.target.value));
  };

  // Render compact header with month selection
  const renderCompactHeader = () => (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={month}
            onChange={handleChangeMonth}
            displayEmpty
            variant="outlined"
            sx={{ height: 36 }}
          >
            {monthNames.map((name, index) => (
              <MenuItem key={index} value={index}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={year}
            onChange={handleChangeYear}
            displayEmpty
            variant="outlined"
            sx={{ height: 36 }}
          >
            {Array.from(
              { length: 10 },
              (_, i) => new Date().getFullYear() - 4 + i,
            ).map((yearOption) => (
              <MenuItem key={yearOption} value={yearOption}>
                {yearOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={selectedOption}
          exclusive
          onChange={(e, value) =>
            value && handleValueChange({ target: { value } })
          }
          size="small"
        >
          <ToggleButton value="Month" sx={{ py: 0.5, px: 1 }}>
            ทั้งเดือน
          </ToggleButton>
          <ToggleButton value="15" sx={{ py: 0.5, px: 1 }}>
            1-15
          </ToggleButton>
          <ToggleButton value="31" sx={{ py: 0.5, px: 1 }}>
            16-{daysInMonth}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Active filters badge */}
        {(emSelect ||
          projectSelect ||
          roleSelect ||
          selectedOption !== 'Month') && (
          <Chip
            icon={<FilterAltIcon fontSize="small" />}
            label={`ตัวกรอง ${
              [emSelect, projectSelect, roleSelect].filter(Boolean).length +
              (selectedOption !== 'Month' ? 1 : 0)
            }`}
            size="small"
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            deleteIcon={
              showFilters ? (
                <KeyboardArrowLeftIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )
            }
            onDelete={() => setShowFilters(!showFilters)}
          />
        )}

        {me?.userData?.permissions?.hr_management && (
          <Button
            variant="contained"
            size="small"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
          >
            พิมพ์
          </Button>
        )}
      </Box>
    </Box>
  );

  // Render top filters panel (simplified)

  // Render report content with minimal styling
  const renderReportContent = () => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          p: 1,
          bgcolor: alpha(theme.palette.background.default, 0.5),
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" fontWeight={500}>
          รายงานข้อมูล
          {selectedOption === 'Month'
            ? 'ทั้งเดือน'
            : selectedOption === '15'
            ? ' 1-15'
            : ` 16-${daysInMonth}`}{' '}
          {monthNames[month]} {year}
        </Typography>

        <Box>
          <IconButton size="small" onClick={handlePreviousMonth}>
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setMonth(dayjs().month());
              setYear(dayjs().year());
            }}
          >
            <TodayIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth}>
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box>
          <FormControl required fullWidth size="small">
            <Select
              onChange={(event) => setTypeSelect(event.target.value)}
              value={typeSelect}
              displayEmpty
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

      <Fade in={true} timeout={500}>
        <Box>
          <Monthlyreport
            timestamp={timestamp}
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
            daysInMonth={daysInMonth}
            days={days}
            dateStart={dateStart}
            handleValueChange={handleValueChange}
            selectedOption={selectedOption}
            permission={me?.userData?.permissions}
          />
        </Box>
      </Fade>
    </Paper>
  );
  const renderProjectCost = () => (
    <div>
      <TimestampProjectCost timestamp={timestamp} />
    </div>
  );

  if (timestamp.loading || !timestamp.isCompleted) {
    return <Loading isLoading />;
  }
  return (
    <div>
      {renderCompactHeader()}
      {renderReportContent()}
      {renderProjectCost()}
    </div>
  );
}
