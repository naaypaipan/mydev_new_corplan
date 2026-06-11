import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import {
  Avatar,
  Card,
  Typography,
  Chip,
  Box,
  Divider,
  Grid,
  IconButton,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Business as ProjectIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  DateRange as DateIcon,
  AttachMoney as SalaryIcon,
  ChevronLeft,
  ChevronRight,
  CalendarMonth as CalendarIcon,
  ViewList as ViewListIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Schedule as OTIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

export default function PersonalProfile({ title, subtitle }) {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.me);
  const timestamp = useSelector((state) => state.timestamp);
  const project = useSelector((state) => state.project);
  const salary = useSelector((state) => state.salary);
  const profile = me?.userData;

  const [viewMode, setViewMode] = useState('calendar');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedSalaryIndex, setExpandedSalaryIndex] = useState(null);

  useEffect(() => {
    dispatch(actions.meGet());
    dispatch(actions.timestampAll({ profile: profile?._id }));
    dispatch(actions.projectAll({ profile: profile?._id }));
    dispatch(actions.salaryAll({ profile: profile?._id }));

    return () => {};
  }, []);

  const renderDetail = () => (
    <Card className="mb-4">
      <Box className="relative">
        <Box className="h-28 " />
        <Avatar
          src={profile?.image?.url}
          sx={{
            width: 120,
            height: 120,
            border: '4px solid white',
            position: 'absolute',
            bottom: -60,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </Box>
      <Box className="pt-16 pb-4 text-center">
        <Typography variant="h5" className="font-bold">
          {profile?.firstname} {profile?.lastname}
        </Typography>
        <Chip label={profile?.role?.name} color="primary" className="mt-2" />
      </Box>
      <Divider />
      <Grid container spacing={2} className="p-4">
        <Grid item xs={12} md={6}>
          <Box className="flex items-center gap-2">
            <PhoneIcon color="action" />
            <Box>
              <Typography variant="caption" color="textSecondary">
                เบอร์โทรศัพท์
              </Typography>
              <Typography>{profile?.phone_number || '-'}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box className="flex items-center gap-2">
            <WorkIcon color="action" />
            <Box>
              <Typography variant="caption" color="textSecondary">
                แผนก
              </Typography>
              <Typography>{profile?.department?.name || '-'}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box className="flex items-center gap-2">
            <SalaryIcon color="action" />
            <Box>
              <Typography variant="caption" color="textSecondary">
                เงินเดือน
              </Typography>
              <Typography>{profile?.salary?.month} บาท</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box className="flex items-center gap-2">
            <DateIcon color="action" />
            <Box>
              <Typography variant="caption" color="textSecondary">
                วันที่เริ่มงาน
              </Typography>
              <Typography>
                {dayjs(profile?.start_date).format('DD/MM/YYYY') || '-'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const rendertimestamp = () => {
    // แปลงข้อมูล timestamp เป็น events สำหรับ FullCalendar
    const events =
      timestamp?.rows?.map((item) => {
        const hasOT = item.otRequests;
        return {
          id: item._id,
          title: 'ทำงานปกติ',
          start: item.checkIn,
          end: item.checkIn,
          backgroundColor: '#4caf50',
          extendedProps: {
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            otRequests: [item.otRequests],
            hasOT: hasOT,
          },
        };
      }) || [];

    const getRateChip = (rate) => {
      const rateConfig = {
        1: { label: 'X1', color: 'primary' },
        1.5: { label: 'X1.5', color: 'warning' },
        3: { label: 'X3', color: 'error' },
      };
      const config = rateConfig[rate] || rateConfig[1];
      return (
        <Chip
          label={config.label}
          color={config.color}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      );
    };

    const renderListView = () => {
      if (!timestamp?.rows || timestamp.rows.length === 0) {
        return (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ไม่มีข้อมูลการลงเวลา
            </Typography>
          </Box>
        );
      }

      return (
        <List sx={{ maxHeight: 500, overflow: 'auto' }}>
          {timestamp.rows.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 2,
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" fontWeight={600}>
                    {dayjs(item.checkIn).format('DD MMM YYYY')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(item.checkIn).format('dddd')}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LoginIcon fontSize="small" color="success" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Check In
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {item.checkIn
                          ? dayjs(item.checkIn).format('HH:mm')
                          : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LogoutIcon fontSize="small" color="error" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Check Out
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {item.checkOut
                          ? dayjs(item.checkOut).format('HH:mm')
                          : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Chip
                    label={
                      item.checkOut
                        ? 'เช็คอินและเช็คเอาท์'
                        : 'เช็คอินอย่างเดียว'
                    }
                    color={item.checkOut ? 'success' : 'warning'}
                    size="small"
                    sx={{ width: '100%' }}
                  />
                </Grid>
              </Grid>

              {/* แสดงรายละเอียด OT */}
              {item.otRequests && item.otRequests.length > 0 && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <OTIcon fontSize="small" color="warning" />
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="warning.main"
                    >
                      รายการ OT
                    </Typography>
                  </Box>
                  <Stack spacing={1}>
                    {item.otRequests.map((ot, otIndex) => (
                      <Box
                        key={otIndex}
                        sx={{
                          p: 1.5,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Grid container spacing={1.5} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                เวลา OT:
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {dayjs(ot.startTime).format('HH:mm')} -{' '}
                                {dayjs(ot.endTime).format('HH:mm')}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ชั่วโมง:
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {ot.total_hours?.toFixed(1) || 0} ชม.
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                อัตรา:
                              </Typography>
                              {getRateChip(ot.rate)}
                            </Stack>
                          </Grid>
                          {ot.description && (
                            <Grid item xs={12}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                รายละเอียด: {ot.description}
                              </Typography>
                            </Grid>
                          )}
                          {ot.status && (
                            <Grid item xs={12}>
                              <Chip
                                label={ot.status}
                                size="small"
                                color={
                                  ot.status === 'APPROVED'
                                    ? 'success'
                                    : ot.status === 'PENDING'
                                    ? 'warning'
                                    : 'error'
                                }
                              />
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      );
    };

    return (
      <Card className="h-full">
        {/* Header */}
        <Box className="p-4 border-b">
          <Box className="flex items-center justify-between flex-wrap gap-2">
            <Box className="flex items-center gap-2">
              <CalendarIcon color="primary" />
              <Typography variant="h6" className="font-bold">
                ปฏิทินการลงเวลา
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="calendar">
                <CalendarIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Content */}
        <Box className="p-4">
          {viewMode === 'calendar' ? (
            <Box sx={{ '& .fc': { fontFamily: 'inherit' } }}>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="th"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek',
                }}
                events={events}
                eventClick={handleEventClick}
                height="auto"
                buttonText={{
                  today: 'วันนี้',
                  month: 'เดือน',
                  week: 'สัปดาห์',
                }}
                dayHeaderFormat={{ weekday: 'short' }}
              />
            </Box>
          ) : (
            renderListView()
          )}
        </Box>

        {/* Event Detail Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                รายละเอียดการลงเวลา
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedEvent && (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LoginIcon fontSize="small" color="success" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Check In
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {dayjs(selectedEvent.checkIn).format(
                            'DD/MM/YYYY HH:mm',
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LogoutIcon fontSize="small" color="error" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Check Out
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedEvent.checkOut
                            ? dayjs(selectedEvent.checkOut).format(
                                'DD/MM/YYYY HH:mm',
                              )
                            : '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {selectedEvent.hasOT && selectedEvent.otRequests && (
                  <>
                    <Divider />
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <OTIcon fontSize="small" color="warning" />
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="warning.main"
                        >
                          รายการ OT
                        </Typography>
                      </Box>
                      <Stack spacing={1.5}>
                        {selectedEvent.otRequests.map((ot, otIndex) => (
                          <Box
                            key={otIndex}
                            sx={{
                              p: 2,
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Grid container spacing={1.5}>
                              <Grid item xs={12}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    เวลา OT:
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {dayjs(ot.startTime).format('HH:mm')} -{' '}
                                    {dayjs(ot.endTime).format('HH:mm')}
                                  </Typography>
                                </Stack>
                              </Grid>
                              <Grid item xs={6}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ชั่วโมง:
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {ot.total_hours?.toFixed(1) || 0} ชม.
                                  </Typography>
                                </Stack>
                              </Grid>
                              <Grid item xs={6}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    อัตรา:
                                  </Typography>
                                  {getRateChip(ot.rate)}
                                </Stack>
                              </Grid>
                              {ot.description && (
                                <Grid item xs={12}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    รายละเอียด:
                                  </Typography>
                                  <Typography variant="body2">
                                    {ot.description}
                                  </Typography>
                                </Grid>
                              )}
                              {ot.status && (
                                <Grid item xs={12}>
                                  <Chip
                                    label={ot.status}
                                    size="small"
                                    color={
                                      ot.status === 'APPROVE'
                                        ? 'success'
                                        : ot.status === 'PENDING'
                                        ? 'warning'
                                        : 'error'
                                    }
                                  />
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>ปิด</Button>
          </DialogActions>
        </Dialog>
      </Card>
    );
  };

  const renderSalaryList = () => {
    const salaryData = salary?.rows || [];

    if (!salaryData || salaryData.length === 0) {
      return (
        <Card className="h-full">
          <Box className="p-4 border-b">
            <Box className="flex items-center gap-2">
              <SalaryIcon color="primary" />
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
        </Card>
      );
    }

    return (
      <Card className="h-full">
        {/* Header */}
        <Box className="p-4 border-b">
          <Box className="flex items-center justify-between gap-2">
            <Box className="flex items-center gap-2">
              <SalaryIcon color="primary" />
              <Typography variant="h6" className="font-bold">
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
                    borderRadius: 1,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
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
                        {dayjs(salaryItem.dateStart).format('MMMM YYYY')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(salaryItem.dateStart).format('DD/MM/YYYY')}-
                        {dayjs(salaryItem.dateEnd).format('DD/MM/YYYY')}
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
                            ? 'rotate(180deg)'
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
                                  bgcolor: 'grey.50',
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
                                  {dayjs(salaryItem.dateStart).format(
                                    'DD/MM/YYYY',
                                  )}
                                  -{' '}
                                  {dayjs(salaryItem.dateEnd).format(
                                    'DD/MM/YYYY',
                                  )}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  bgcolor: 'grey.50',
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
                            className="mb-2"
                          >
                            รายได้
                          </Typography>
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: 'grey.50',
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

                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: 'grey.50',
                                borderRadius: 1,
                              }}
                            >
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
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: 'grey.50',
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
                                bgcolor: 'grey.50',
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
                                bgcolor: 'grey.50',
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
                                bgcolor: 'success.50',
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
                            className="mb-2"
                          >
                            รายการหัก
                          </Typography>
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: 'grey.50',
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
                                bgcolor: 'grey.50',
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
                                bgcolor: 'grey.50',
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
                                bgcolor: 'error.50',
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
                            bgcolor: 'error.50',
                            borderRadius: 1,
                            fontWeight: 600,
                          }}
                        >
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            เงินเดือนรับสุทธิ
                          </Typography>
                          <Typography variant="h5">
                            {Number(netSalary).toLocaleString('th-TH')} บาท
                          </Typography>
                        </Box>

                        {/* Notes Section */}
                        {salaryItem.note && (
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
                                  {salaryItem.note}
                                </Typography>
                              </Box>
                            </Box>
                          </>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Card>
    );
  };

  return (
    <div>
      {/* {renderTitle()} */}
      {renderDetail()}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          {rendertimestamp()}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSalaryList()}
        </Grid>
      </Grid>
    </div>
  );
}
