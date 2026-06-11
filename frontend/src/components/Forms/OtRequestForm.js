import React, { useState } from 'react';
import {
  Divider,
  Grid,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Paper,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  FormControl,
  Chip,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery, // เพิ่ม useMediaQuery
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import {
  CalendarToday as CalendarIcon,
  GroupAdd as GroupAddIcon,
  Business as BusinessIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon, // เพิ่ม CloseIcon
} from '@mui/icons-material';
dayjs.locale('th');

export default function OtRequestForm({
  Controller,
  control,
  timestamp = [],
  onSubmit,
  project = [],
  claimOT,
  setClaimOT,
  selectedEmployees,
  setSelectedEmployees,
  selectedProject,
  setSelectedProject,
  date,
  setDate,
  fetchTimestamp,
  rate,
  setRate,
  rateApprove = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // ตรวจสอบว่าเป็นหน้าจอมือถือหรือไม่
  // เพิ่ม state สำหรับควบคุม Modal เลือกพนักงาน
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);

  const otTypes = [
    { value: 1, label: 'โอทีปกติ/เดินทาง', rate: '1x', color: 'primary' },
    {
      value: 1.5,
      label: 'โอทีวันปกติหลังเลิกงาน',
      rate: '1.5x',
      color: 'warning',
    },
    { value: 3, label: 'โอทีพิเศษ', rate: '3x', color: 'error' },
  ];

  // สร้างรายการพนักงานจาก timestamp
  const employeeOptions = Array.isArray(timestamp?.rows)
    ? timestamp?.rows
        .map((item) => ({
          _id: item._id,
          employee_id: item.employee?._id,
          name:
            (item.employee?.firstname || '') +
            ' ' +
            (item.employee?.lastname || ''),
          department: item.employee?.department?.name || '',
          role: item.employee?.role?.name || '',
          salary: item.salary || {},
          checkIn: item.checkIn,
        }))
        .filter(
          (e, i, arr) => e._id && arr.findIndex((x) => x._id === e._id) === i,
        )
    : [];

  // สร้างรายการโปรเจค
  const projectOptions = Array.isArray(project?.rows)
    ? project?.rows.map((p) => ({
        _id: p._id,
        name: p.name,
        number: p.project_number,
      }))
    : [];

  // สร้าง options สำหรับเวลาแบบ interval 30 นาที
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
    timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
  }
  timeOptions.push(`23:59`);

  // ฟังก์ชันแปลง string เป็น dayjs object
  const toDayjsTime = (str) => {
    const [hour, minute] = str.split(':');
    return dayjs().hour(Number(hour)).minute(Number(minute)).second(0);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: isMobile ? 1 : 0 }}>
      {/* Header Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: isMobile ? 2 : 3, // ปรับ padding ตามขนาดหน้าจอ
          mb: isMobile ? 2 : 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.common.white, 0.2),
              width: isMobile ? 48 : 56, // ปรับขนาด Avatar
              height: isMobile ? 48 : 56,
            }}
          >
            <TimeIcon fontSize={isMobile ? 'medium' : 'large'} />
          </Avatar>
          <Box>
            <Typography
              variant={isMobile ? 'h6' : 'h5'} // ปรับขนาด Font
              fontWeight={700}
            >
              แบบฟอร์มขอทำโอที
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              กรุณากรอกข้อมูลให้ครบถ้วนเพื่อส่งคำขอ OT
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Main Form */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          {/* Checkbox ขอโอทีย้อนหลัง */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              borderRadius: 2,
              border: `1px dashed ${theme.palette.warning.main}`,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={claimOT}
                  onChange={(e) => setClaimOT(e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Typography variant="body2" fontWeight={500}>
                  ขอโอทีย้อนหลัง
                </Typography>
              }
            />
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
            <Grid container spacing={2}>
              {/* วันที่และเวลา Section */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <CalendarIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    วันที่และเวลา
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="date"
                  control={control}
                  defaultValue={dayjs()}
                  render={({ field }) => (
                    <DatePicker
                      label="วันที่ขอ OT"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setDate(e);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth size="small" />
                      )}
                      minDate={claimOT ? undefined : dayjs()}
                      maxDate={dayjs()}
                      disableFuture={!claimOT}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <Controller
                  name="startTime"
                  control={control}
                  defaultValue={dayjs().hour(17).minute(0)}
                  render={({ field }) => (
                    <TextField
                      select
                      label="เวลาเริ่ม OT"
                      fullWidth
                      value={
                        field.value ? dayjs(field.value).format('HH:mm') : ''
                      }
                      onChange={(e) =>
                        field.onChange(toDayjsTime(e.target.value))
                      }
                      size="small"
                    >
                      {timeOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <Controller
                  name="endTime"
                  control={control}
                  defaultValue={dayjs().hour(20).minute(0)}
                  render={({ field }) => (
                    <TextField
                      select
                      label="เวลาสิ้นสุด OT"
                      fullWidth
                      value={
                        field.value ? dayjs(field.value).format('HH:mm') : ''
                      }
                      onChange={(e) =>
                        field.onChange(toDayjsTime(e.target.value))
                      }
                      size="small"
                    >
                      {timeOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              {rateApprove && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }} />
                </Grid>
              )}
              {rateApprove && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <TimeIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      ประเภท OT
                    </Typography>
                  </Box>
                </Grid>
              )}

              {rateApprove && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>เลือกประเภท OT</InputLabel>
                    <Select
                      value={rate}
                      label="เลือกประเภท OT"
                      onChange={(e) => setRate(e.target.value)}
                    >
                      {otTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Typography>{type.label}</Typography>
                            <Chip
                              label={type.rate}
                              size="small"
                              color={type.color}
                              sx={{ fontWeight: 600 }}
                            />
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>

              {/* โครงการ Section */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <BusinessIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    โครงการ
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={projectOptions}
                  getOptionLabel={(option) =>
                    option.number
                      ? `${option.number} - ${option.name}`
                      : option.name
                  }
                  value={selectedProject}
                  onChange={(_, value) => setSelectedProject(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="เลือกโครงการ"
                      size="small"
                      required
                      placeholder="พิมพ์เพื่อค้นหาโครงการ"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option?._id === value?._id
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>

              {/* พนักงาน Section */}

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  พนักงาน
                </Typography>
              </Grid>

              <Grid item xs={12}>
                {/* Input แสดงจำนวนคนที่เลือก และกดเพื่อเปิด Modal */}
                <TextField
                  fullWidth
                  label="รายชื่อพนักงาน"
                  placeholder={
                    !selectedProject
                      ? 'กรุณาเลือกโครงการก่อน'
                      : 'คลิกเพื่อเลือกพนักงาน'
                  }
                  disabled={!selectedProject} // ปิดการใช้งานถ้ายังไม่เลือกโปรเจค
                  value={
                    selectedEmployees.length > 0
                      ? `เลือกแล้ว ${selectedEmployees.length} คน`
                      : ''
                  }
                  onClick={() => {
                    if (selectedProject) setOpenEmployeeModal(true);
                  }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton
                        edge="end"
                        onClick={() => {
                          if (selectedProject) setOpenEmployeeModal(true);
                        }}
                        disabled={!selectedProject} // ปิดปุ่มไอคอนด้วย
                      >
                        <GroupAddIcon />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      cursor: !selectedProject ? 'default' : 'pointer',
                    },
                    '& input': {
                      cursor: !selectedProject ? 'default' : 'pointer',
                    },
                  }}
                />

                {/* Modal สำหรับเลือกพนักงาน */}
                <Dialog
                  open={openEmployeeModal}
                  onClose={() => setOpenEmployeeModal(false)}
                  maxWidth="sm"
                  fullWidth
                  fullScreen={isMobile} // แสดงเต็มหน้าจอบนมือถือ
                >
                  <DialogTitle sx={{ m: 0, p: 2 }}>
                    เลือกพนักงาน
                    {isMobile ? (
                      <IconButton
                        aria-label="close"
                        onClick={() => setOpenEmployeeModal(false)}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          color: (theme) => theme.palette.grey[500],
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    ) : null}
                  </DialogTitle>
                  <DialogContent dividers>
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        mb: 2,
                        bgcolor: alpha(theme.palette.background.default, 0.4),
                      }}
                    >
                      <FormControlLabel
                        label={
                          <Typography variant="body2" fontWeight={500}>
                            เลือกทั้งหมด ({employeeOptions.length})
                          </Typography>
                        }
                        control={
                          <Checkbox
                            checked={
                              employeeOptions.length > 0 &&
                              selectedEmployees.length ===
                                employeeOptions.length
                            }
                            indeterminate={
                              selectedEmployees.length > 0 &&
                              selectedEmployees.length < employeeOptions.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees(employeeOptions);
                              } else {
                                setSelectedEmployees([]);
                              }
                            }}
                          />
                        }
                      />
                    </Box>
                    <Box
                      sx={{
                        maxHeight: isMobile ? 'none' : 400,
                        overflow: 'auto',
                      }}
                    >
                      {employeeOptions.length > 0 ? (
                        <Grid container spacing={1}>
                          {employeeOptions.map((option) => (
                            <Grid item xs={12} sm={6} key={option._id}>
                              <FormControlLabel
                                sx={{ width: '100%', m: 0 }}
                                control={
                                  <Checkbox
                                    checked={selectedEmployees.some(
                                      (emp) => emp._id === option._id,
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedEmployees([
                                          ...selectedEmployees,
                                          option,
                                        ]);
                                      } else {
                                        setSelectedEmployees(
                                          selectedEmployees.filter(
                                            (emp) => emp._id !== option._id,
                                          ),
                                        );
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="body2">
                                    {option.name}
                                  </Typography>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textAlign: 'center', p: 3 }}
                        >
                          กรุณาเลือกวันที่เพื่อแสดงรายชื่อพนักงาน
                        </Typography>
                      )}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => setOpenEmployeeModal(false)}
                      variant="contained"
                    >
                      ตกลง
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>

              {/* เหตุผล Section */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <DescriptionIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    เหตุผลในการขอ OT
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name={'description'}
                  control={control}
                  defaultValue={''}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      required
                      label="เหตุผล"
                      helperText="กรุณาระบุเหตุผลอย่างละเอียด เพื่อประกอบการพิจารณา"
                      placeholder="เช่น งานเร่งด่วน, ปิดโปรเจค, แก้ไขปัญหาระบบ, ลูกค้าต้องการด่วน"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: alpha(theme.palette.background.default, 0.5),
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.3,
                    )}`,
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(
                        theme.palette.primary.main,
                        0.4,
                      )}`,
                    },
                  }}
                >
                  ส่งคำขอ OT
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </CardContent>
      </Card>
    </Box>
  );
}
