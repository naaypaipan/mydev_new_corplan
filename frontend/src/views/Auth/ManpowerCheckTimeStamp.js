import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  Stack,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewListIcon from '@mui/icons-material/ViewList';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ChevronRight from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import relativeTime from 'dayjs/plugin/relativeTime';
import _ from 'lodash';

dayjs.locale('th');
dayjs.extend(relativeTime);

export default function ManpowerCheckTimeStamp() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const manpower = useSelector((state) => state.manpower);

  const [searchFirstname, setSearchFirstname] = useState('');
  const [searchLastname, setSearchLastname] = useState('');
  const [searchTaxId, setSearchTaxId] = useState('');
  const [viewMode, setViewMode] = useState('calendar');
  const [dateStart, setDateStart] = useState(
    dayjs().startOf('month').toISOString(),
  );
  const [dateEnd, setDateEnd] = useState(dayjs().endOf('month').toISOString());
  const [openEventModal, setOpenEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [expandedSalaryIndex, setExpandedSalaryIndex] = useState(null);
  const [calendarStartDate, setCalendarStartDate] = useState(dayjs());
  const [calendarView, setCalendarView] = useState(isMobile ? 'week' : 'month');

  const handleSearch = async () => {
    if (!searchFirstname.trim() || !searchLastname.trim() || !searchTaxId.trim())
      return alert('กรุณากรอกข้อมูลให้ครบทั้ง ชื่อ นามสกุล และเลขบัตรประชาชน');

    await dispatch(
      actions.manpowerAll({
        firstname: searchFirstname.trim(),
        lastname: searchLastname.trim(),
        taxId: searchTaxId.trim(),
      }),
    );
  };

  const handleClearSearch = () => {
    setSearchFirstname('');
    setSearchLastname('');
    setSearchTaxId('');
    dispatch(actions.manpowerReset());
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const calendarEvents = _.map(manpower?.timestamps, (item) => ({
    id: item._id,
    title: `${item?.employee_firstname} ${item?.employee_lastname}`,
    date: dayjs(item?.createdAt).format('YYYY-MM-DD'),
    backgroundColor: item?.out_of_location ? '#dc3545' : '#28a745',
    borderColor: item?.out_of_location ? '#dc3545' : '#28a745',
    extendedProps: {
      ...item,
    },
  }));

  const renderSearchSection = () => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        mb: 3,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,

          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <SearchIcon />
        ค้นหารายการลงเวลา
      </Typography>

      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            label="ชื่อ"
            variant="outlined"
            value={searchFirstname}
            required
            size="small"
            onChange={(e) => setSearchFirstname(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            sx={{
              flex: 1,
              minWidth: 140,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
            }}
          />

          <TextField
            label="นามสกุล"
            variant="outlined"
            value={searchLastname}
            required
            size="small"
            onChange={(e) => setSearchLastname(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            sx={{
              flex: 1,
              minWidth: 140,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
            }}
          />

          <TextField
            label="เลขบัตรประชาชน"
            variant="outlined"
            value={searchTaxId}
            required
            size="small"
            onChange={(e) => setSearchTaxId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            sx={{
              flex: 1,
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{
              borderRadius: 2.5,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
              },
            }}
          >
            ค้นหา
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Chip
            icon={<PersonIcon />}
            label={`พบทั้งหมด ${
              manpower?.timestamps?.length || 0
            } รายการลงเวลา`}
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              py: 2.5,
              px: 1,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}
          />

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            sx={{
              '& .MuiToggleButton-root': {
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                '&.Mui-selected': {
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                },
              },
            }}
          >
            <ToggleButton value="calendar">
              <CalendarMonthIcon sx={{ mr: 1 }} />
              ปฏิทิน
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon sx={{ mr: 1 }} />
              รายการ
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Stack>
    </Paper>
  );

  const renderCalendarView = () => {
    const getDaysInMonth = (date) => {
      const firstDay = date.startOf('month');
      const lastDay = date.endOf('month');
      const startDate = firstDay.startOf('week');
      const endDate = lastDay.endOf('week');

      const daysArray = [];
      let current = startDate;
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        daysArray.push(current);
        current = current.add(1, 'day');
      }
      return daysArray;
    };

    const getEventsForDay = (date) => {
      return _.filter(calendarEvents, (event) =>
        dayjs(event.date).isSame(date, 'day'),
      );
    };

    const monthDays = getDaysInMonth(calendarStartDate);
    const weekDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    if (isMobile) {
      // Mobile: Timeline/List View
      return (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 2.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() =>
                setCalendarStartDate(calendarStartDate.add(-1, 'month'))
              }
              sx={{ color: 'white' }}
            >
              <ChevronRight sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ color: 'white' }}
              >
                {calendarStartDate.format('MMMM')}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.9)' }}
              >
                {calendarStartDate.format('YYYY')}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() =>
                setCalendarStartDate(calendarStartDate.add(1, 'month'))
              }
              sx={{ color: 'white' }}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Day Grid - Simple 7 columns */}
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {weekDays.map((day, idx) => (
                <Grid item xs={12 / 7} key={idx}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    align="center"
                    display="block"
                    sx={{ color: '#667eea', py: 0.5 }}
                  >
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={0.5}>
              {monthDays.map((day, idx) => {
                const events = getEventsForDay(day);
                const isToday = day.isSame(dayjs(), 'day');
                const isCurrentMonth = day.isSame(calendarStartDate, 'month');

                return (
                  <Grid item xs={12 / 7} key={idx}>
                    <Paper
                      onClick={() => {
                        if (events.length > 0) {
                          setSelectedEvent(events[0].extendedProps);
                          setOpenEventModal(true);
                        }
                      }}
                      sx={{
                        p: 1,
                        textAlign: 'center',
                        borderRadius: 1.5,
                        minHeight: 60,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isToday
                          ? '#667eea'
                          : isCurrentMonth
                          ? 'white'
                          : '#fafbfc',
                        border: isToday
                          ? '2px solid #667eea'
                          : '1px solid rgba(102, 126, 234, 0.2)',
                        cursor: events.length > 0 ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: events.length > 0 ? 2 : 0,
                          bgcolor:
                            events.length > 0
                              ? isToday
                                ? '#667eea'
                                : 'rgba(102, 126, 234, 0.05)'
                              : isToday
                              ? '#667eea'
                              : '#fafbfc',
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: isToday ? 'white' : 'text.primary',
                          fontSize: '0.85rem',
                        }}
                      >
                        {day.format('D')}
                      </Typography>
                      {events.length > 0 && (
                        <Box
                          sx={{
                            mt: 0.5,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: isToday
                              ? 'white'
                              : events[0].backgroundColor,
                          }}
                        />
                      )}
                      {events.length > 1 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: isToday ? 'white' : 'primary.main',
                            fontSize: '0.65rem',
                            mt: 0.25,
                          }}
                        >
                          +{events.length - 1}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Paper>
      );
    }

    // Desktop: Full Month Calendar
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <IconButton
            onClick={() =>
              setCalendarStartDate(calendarStartDate.add(-1, 'month'))
            }
            sx={{ color: 'white' }}
          >
            <ChevronRight sx={{ transform: 'rotate(180deg)' }} />
          </IconButton>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
            {calendarStartDate.format('MMMM YYYY')}
          </Typography>
          <IconButton
            onClick={() =>
              setCalendarStartDate(calendarStartDate.add(1, 'month'))
            }
            sx={{ color: 'white' }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Calendar Grid */}
        <Box sx={{ p: 3 }}>
          {/* Day Headers */}
          <Grid container spacing={0} sx={{ mb: 2 }}>
            {[
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ].map((day, idx) => (
              <Grid item xs={12 / 7} key={idx}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  align="center"
                  sx={{
                    color: idx === 0 || idx === 6 ? '#e91e63' : '#667eea',
                    py: 1.5,
                  }}
                >
                  {day.slice(0, 3).toUpperCase()}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Days Grid */}
          <Grid container spacing={1}>
            {monthDays.map((day, idx) => {
              const events = getEventsForDay(day);
              const isToday = day.isSame(dayjs(), 'day');
              const isCurrentMonth = day.isSame(calendarStartDate, 'month');

              return (
                <Grid item xs={12 / 7} key={idx}>
                  <Paper
                    variant="outlined"
                    onClick={() => {
                      if (events.length > 0) {
                        setSelectedEvent(events[0].extendedProps);
                        setOpenEventModal(true);
                      }
                    }}
                    sx={{
                      p: 2,
                      minHeight: 120,
                      borderRadius: 2,
                      bgcolor: isToday
                        ? 'rgba(102, 126, 234, 0.1)'
                        : isCurrentMonth
                        ? 'white'
                        : 'rgba(0, 0, 0, 0.02)',
                      border: isToday
                        ? '2px solid #667eea'
                        : '1px solid rgba(102, 126, 234, 0.15)',
                      cursor: events.length > 0 ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: events.length > 0 ? 4 : 1,
                        transform:
                          events.length > 0 ? 'translateY(-4px)' : 'none',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: isCurrentMonth
                          ? day.day() === 0 || day.day() === 6
                            ? '#e91e63'
                            : '#333'
                          : '#999',
                      }}
                    >
                      {day.format('D')}
                    </Typography>

                    {/* Events */}
                    <Stack spacing={0.5} sx={{ mt: 1, flex: 1 }}>
                      {events.slice(0, 3).map((event, i) => (
                        <Box
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event.extendedProps);
                            setOpenEventModal(true);
                          }}
                          sx={{
                            p: 0.75,
                            borderRadius: 1,
                            bgcolor: event.backgroundColor,
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              opacity: 0.85,
                            },
                          }}
                        >
                          {event.title}
                        </Box>
                      ))}
                      {events.length > 3 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            pl: 0.75,
                          }}
                        >
                          +{events.length - 3} more
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Paper>
    );
  };

  const renderListView = () => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        overflow: 'hidden',
      }}
    >
      {_.isEmpty(manpower?.timestamps) ? (
        <Box
          sx={{
            p: 6,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <SearchIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6">ไม่พบรายการลงเวลา</Typography>
          <Typography variant="body2">
            ลองค้นหาด้วยชื่อพนักงานหรือปรับช่วงเวลา
          </Typography>
        </Box>
      ) : (
        <List sx={{ py: 0 }}>
          {_.map(manpower?.timestamps, (item, index) => (
            <React.Fragment key={item._id || index}>
              <ListItem
                sx={{
                  py: 2.5,
                  px: { xs: 2, sm: 3 },
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <CheckCircleIcon
                        sx={{
                          color: '#28a745',
                          fontSize: 20,
                          bgcolor: 'white',
                          borderRadius: '50%',
                        }}
                      />
                    }
                  >
                    <Avatar
                      src={
                        item?.image ||
                        manpower?.image_profile ||
                        manpower?.image
                      }
                      sx={{
                        width: isMobile ? 48 : 56,
                        height: isMobile ? 48 : 56,
                        border: '2px solid #667eea',
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item?.employee_firstname} {item?.employee_lastname}
                      </Typography>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mt={0.5}
                        flexWrap="wrap"
                      >
                        <Chip
                          icon={<AccessTimeIcon fontSize="small" />}
                          label={dayjs(item?.createdAt).format(
                            'DD/MM/YYYY HH:mm น.',
                          )}
                          size="small"
                          sx={{
                            bgcolor: '#e3f2fd',
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          ({dayjs(item?.createdAt).fromNow()})
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1.5 }}>
                      <Stack spacing={1}>
                        {item?.project_in?.name && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <PlaceIcon fontSize="small" color="primary" />
                            <Typography variant="body2">
                              โครงการ: {item?.project_in?.name}
                            </Typography>
                          </Box>
                        )}

                        {(item?.otRequests || item?.salary_extra?.hr > 0) && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <AccessTimeIcon
                              fontSize="small"
                              sx={{ color: '#f57c00' }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: '#e65100', fontWeight: 500 }}
                            >
                              OT:{' '}
                              {item?.otRequests
                                ? `${
                                    item.otRequests.total_hours
                                  } ชม. (${item.otRequests.total_price?.toFixed(
                                    2,
                                  )} ฿)`
                                : `${item.salary_extra.hr} ชม.`}
                            </Typography>
                          </Box>
                        )}

                        {item?.out_of_location && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOnIcon fontSize="small" color="error" />
                            <Typography variant="body2" color="error">
                              อยู่นอกพื้นที่โครงการ
                            </Typography>
                          </Box>
                        )}

                        {item?.employeeType?.name && (
                          <Typography variant="caption" color="text.secondary">
                            ประเภท: {item?.employeeType?.name}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  }
                />
              </ListItem>

              {index < manpower?.timestamps?.length - 1 && (
                <Divider sx={{ borderColor: 'rgba(102, 126, 234, 0.1)' }} />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
  const renderSalaryList = () => {
    const salaryData = manpower?.salaries || [];

    if (!salaryData || salaryData.length === 0) {
      return (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            height: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
          }}
        >
          <Box className="p-4 border-b">
            <Box className="flex items-center gap-2" sx={{ display: 'flex' }}>
              <AccountBalanceWalletIcon color="primary" />
              <Typography variant="h6" className="font-bold">
                บัญชีเงินเดือน
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ไม่มีข้อมูลเงินเดือน
            </Typography>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          height: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box
            className="flex items-center justify-between gap-2"
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <Box className="flex items-center gap-2" sx={{ display: 'flex' }}>
              <AccountBalanceWalletIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                บัญชีเงินเดือน
              </Typography>
            </Box>
            <Chip
              label={`${salaryData.length} รายการ`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Vertical Card List */}
        <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
          <Stack spacing={2} sx={{ p: 2 }}>
            {salaryData.map((salaryItem, index) => {
              const totalExpenses =
                (salaryItem.expenses.tax || 0) +
                (salaryItem.expenses.sso || 0) +
                (salaryItem.expenses.other || 0);
              const totalIncome =
                (salaryItem.revenue.salary || 0) +
                (salaryItem.revenue.overtime || 0) +
                (salaryItem.revenue.bonus || 0) +
                (salaryItem.revenue.allowances || 0) +
                (salaryItem.revenue.other || 0);
              const netSalary = totalIncome - totalExpenses;

              return (
                <Box
                  key={index}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    bgcolor: 'white',
                    '&:hover': {
                      boxShadow: 2,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {/* Card Header - Summary */}
                  <Box
                    onClick={() =>
                      setExpandedSalaryIndex(
                        expandedSalaryIndex === index ? null : index,
                      )
                    }
                    sx={{
                      p: 2,
                      bgcolor:
                        expandedSalaryIndex === index
                          ? 'primary.50'
                          : 'grey.50',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'primary.50',
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {dayjs(salaryItem.createdAt).format('MMMM YYYY')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(salaryItem.createdAt).format('DD/MM/YYYY')}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', mr: 2 }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="primary.main"
                      >
                        {Number(netSalary).toLocaleString('th-TH')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        บาท สุทธิ
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      sx={{
                        transform:
                          expandedSalaryIndex === index
                            ? 'rotate(90deg)'
                            : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      <ChevronRight fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Expanded Content */}
                  {expandedSalaryIndex === index && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={2}>
                        {/* Date & Working Days */}
                        <Box>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  bgcolor: '#f8f9fa',
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  วันที่
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {dayjs(salaryItem.createdAt).format(
                                    'DD/MM/YYYY',
                                  )}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  bgcolor: '#f8f9fa',
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  จำนวนวันทำงาน
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {salaryItem.totalWork} วัน
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        <Divider />

                        {/* Income Section */}
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            sx={{ mb: 1 }}
                          >
                            รายได้
                          </Typography>
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: '#f8f9fa',
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">เงินเดือน</Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="success.main"
                              >
                                {Number(
                                  salaryItem.revenue.salary || 0,
                                ).toLocaleString('th-TH')}
                              </Typography>
                            </Box>
                            <Typography variant="body2">OT</Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="success.main"
                            >
                              {Number(
                                salaryItem.revenue.overtime || 0,
                              ).toLocaleString('th-TH')}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: '#f8f9fa',
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">
                                เบี้ยเลี้ยง
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="success.main"
                              >
                                {Number(
                                  salaryItem.revenue.allowances || 0,
                                ).toLocaleString('th-TH')}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: '#f8f9fa',
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">
                                เงินได้อื่น
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="success.main"
                              >
                                {Number(
                                  salaryItem.revenue.bonus || 0,
                                ).toLocaleString('th-TH')}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: '#f8f9fa',
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">
                                รายได้อื่นๆ
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="success.main"
                              >
                                {Number(
                                  salaryItem.revenue.other || 0,
                                ).toLocaleString('th-TH')}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: 'rgba(46, 125, 50, 0.08)',
                                borderRadius: 1,
                                fontWeight: 600,
                              }}
                            >
                              <Typography variant="body2" fontWeight={600}>
                                รวมรายได้
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="success.main"
                              >
                                {Number(totalIncome).toLocaleString('th-TH')}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        <Divider />

                        {/* Deductions Section */}
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            sx={{ mb: 1 }}
                          >
                            รายการหัก
                          </Typography>
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: '#f8f9fa',
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">
                                ประกันสังคม
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="error.main"
                              >
                                {Number(
                                  salaryItem.expenses.sso || 0,
                                ).toLocaleString('th-TH')}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: '#f8f9fa',
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">
                                ภาษีเงินได้
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="error.main"
                              >
                                {Number(
                                  salaryItem.expenses.tax || 0,
                                ).toLocaleString('th-TH')}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: '#f8f9fa',
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">หักอื่นๆ</Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="error.main"
                              >
                                {Number(
                                  salaryItem.expenses.other || 0,
                                ).toLocaleString('th-TH')}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: 'rgba(211, 47, 47, 0.08)',
                                borderRadius: 1,
                                fontWeight: 600,
                              }}
                            >
                              <Typography variant="body2" fontWeight={600}>
                                รวมหัก
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="error.main"
                              >
                                {Number(totalExpenses).toLocaleString('th-TH')}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        <Divider
                          sx={{ borderStyle: 'dashed', borderWidth: 2 }}
                        />

                        {/* Net Salary */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            p: 1.5,
                            bgcolor: 'rgba(211, 47, 47, 0.08)',
                            borderRadius: 1,
                            fontWeight: 600,
                          }}
                        >
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            เงินเดือนรับสุทธิ
                          </Typography>
                          <Typography variant="h5" color="primary">
                            {Number(netSalary).toLocaleString('th-TH')} บาท
                          </Typography>
                        </Box>

                        {/* Notes Section */}

                        <>
                          <Divider />
                          <Box>
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              sx={{ mb: 1 }}
                            >
                              หมายเหตุ
                            </Typography>
                            <Box
                              sx={{
                                p: 1.5,
                                bgcolor: '#fff3e0',
                                borderRadius: 1,
                                borderLeft: '4px solid #ff9800',
                              }}
                            >
                              <Typography variant="body2">
                                {salaryItem.note || 'ไม่มีหมายเหตุเพิ่มเติม'}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      </Stack>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Paper>
    );
  };

  const renderEventModal = () => (
    <Dialog
      open={openEventModal}
      onClose={() => setOpenEventModal(false)}
      fullWidth
      fullScreen={isMobile}
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 3 },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        รายละเอียดการลงเวลา
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {selectedEvent && (
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={selectedEvent.employee?.image_profile}
                sx={{ width: 72, height: 72, border: '3px solid #f0f2f5' }}
              />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {selectedEvent.employee_firstname}{' '}
                  {selectedEvent.employee_lastname}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {selectedEvent.employee?.role?.name || 'ตำแหน่งทั่วไป'}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={0.5}
                  >
                    เวลาเข้างาน
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <AccessTimeIcon color="success" fontSize="small" />
                    <Typography variant="body1" fontWeight="600">
                      {selectedEvent.checkIn
                        ? dayjs(selectedEvent.checkIn).format('HH:mm')
                        : '-'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {selectedEvent.checkIn
                      ? dayjs(selectedEvent.checkIn).format('DD/MM/YYYY')
                      : ''}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={0.5}
                  >
                    เวลาออกงาน
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <AccessTimeIcon color="error" fontSize="small" />
                    <Typography variant="body1" fontWeight="600">
                      {selectedEvent.checkOut
                        ? dayjs(selectedEvent.checkOut).format('HH:mm')
                        : '-'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {selectedEvent.checkOut
                      ? dayjs(selectedEvent.checkOut).format('DD/MM/YYYY')
                      : ''}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{ p: 2, borderRadius: 2, border: '1px dashed #bdbdbd' }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    รายละเอียด OT
                  </Typography>
                  {selectedEvent.otRequests ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          เวลาเข้า (OT)
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {dayjs(selectedEvent.otRequests.startTime).format(
                            'HH:mm',
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          เวลาออก (OT)
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {dayjs(selectedEvent.otRequests.endTime).format(
                            'HH:mm',
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          จำนวนชั่วโมง
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {selectedEvent.otRequests.total_hours} ชม.
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          เรท
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          x{selectedEvent.otRequests.rate}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          จำนวนเงิน
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          color="primary"
                        >
                          {selectedEvent.otRequests.total_price?.toFixed(2)} ฿
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant="body1">
                      {selectedEvent.salary_extra?.hr
                        ? `${selectedEvent.salary_extra.hr} ชั่วโมง`
                        : 'ไม่มีรายการ OT'}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  โครงการ
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <PlaceIcon color="action" />
                  <Typography variant="body1">
                    {selectedEvent.project_in?.name || '-'}
                  </Typography>
                </Box>
              </Grid>

              {selectedEvent.note && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    หมายเหตุ
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}
                  >
                    {selectedEvent.note}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={() => setOpenEventModal(false)}
          variant="contained"
          color="secondary"
        >
          ปิดหน้าต่าง
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',

        py: { xs: 2, sm: 4 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {renderSearchSection()}
        {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
        {renderEventModal()}
        <Box sx={{ mt: 4 }}>{renderSalaryList()}</Box>
      </Container>
    </Box>
  );
}
