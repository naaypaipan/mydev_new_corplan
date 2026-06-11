import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Stack,
  Paper,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import * as actions from '../../redux/actions';
import { times } from 'lodash';

dayjs.locale('th');

export default function AddOtRequest({ title, subtitle }) {
  const theme = useTheme();
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();

  const me = useSelector((state) => state.me);
  const timestamp = useSelector((state) => state.timestamp);

  useEffect(() => {
    dispatch(actions.timestampGet(id));

    return () => {};
  }, []);

  const [formData, setFormData] = useState({
    date: dayjs(),
    startTime: dayjs(),
    endTime: dayjs(),
    description: '',
    type: 'normal',
    isUrgent: false,
    department: '',
    project: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState(0);

  // Mock data
  const otTypes = [
    { value: 1.5, label: 'โอที ปกติ', rate: '1.5x' },
    { value: 2.0, label: 'โอที วันหยุด', rate: '2.0x' },
    { value: 2.5, label: 'โอที ฉุกเฉิน', rate: '2.5x' },
  ];

  // Calculate OT hours
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const hours = formData.endTime.diff(formData.startTime, 'hour', true);

      // ปัดเป็นจำนวนเต็มหรือ .5
      const roundedHours = Math.round(hours * 2) / 2;

      setEstimatedHours(roundedHours > 0 ? roundedHours : 0);
    }
  }, [formData.startTime, formData.endTime]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    const confirm = window.confirm('บันทึกคำขอ OT ');
    if (confirm) {
      console.log('ffff', timestamp?.project_in?._id);

      try {
        // Simulate API call
        const dataSubmit = {
          employee: me?.userData?._id,
          timestamp: id,
          total_hours: estimatedHours,
          ...formData,
        };
        console.log('data', dataSubmit);

        await dispatch(actions.otRequestCreate(dataSubmit));
        await alert('ส่งคำขอ OT เรียบร้อยแล้ว');
        history.push('/profile/timestamp');
        history.goBack();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      date: dayjs(),
      startTime: dayjs().hour(18).minute(0),
      endTime: dayjs().hour(20).minute(0),
      description: '',
      otType: 'normal',
      isUrgent: false,
      department: '',
      project: '',
    });
    setErrors({});
  };



  const renderOTSummary = () => (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.info.main, 0.03),
        borderColor: alpha(theme.palette.info.main, 0.2),
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'info.main',
            color: 'white',
          }}
        >
          <ScheduleIcon />
        </Box>
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            สรุปการขอ OT
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                จำนวนชั่วโมง
              </Typography>
              <Typography variant="h6" fontWeight={600} color="info.main">
                {estimatedHours.toFixed(1)} ชม.
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                อัตราค่าแรง
              </Typography>
              <Typography variant="h6" fontWeight={600} color="success.main">
                {otTypes.find((t) => t.value === formData.otType)?.rate ||
                  '1.5x'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                วันที่ขอ
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formData.date.format('DD/MM/YYYY')}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                สถานะ
              </Typography>
              <Chip
                label={formData.isUrgent ? 'ด่วน' : 'ปกติ'}
                color={formData.isUrgent ? 'error' : 'default'}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );

  const renderForm = () => (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
          <Grid container spacing={3}>
            {/* วันที่และเวลา */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                <CalendarIcon
                  fontSize="small"
                  sx={{ mr: 1, verticalAlign: 'middle' }}
                />
                วันที่และเวลา
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="วันที่ขอ OT"
                value={formData.date}
                onChange={(value) => handleInputChange('date', value)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
                minDate={dayjs()}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TimePicker
                label="เวลาเริ่มต้น"
                value={formData.startTime}
                onChange={(value) => handleInputChange('startTime', value)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TimePicker
                label="เวลาสิ้นสุด"
                value={formData.endTime}
                onChange={(value) => handleInputChange('endTime', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    error={!!errors.time}
                    helperText={errors.time}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* ประเภท OT */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                <BusinessIcon
                  fontSize="small"
                  sx={{ mr: 1, verticalAlign: 'middle' }}
                />
                ประเภทและรายละเอียด
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>ประเภท OT</InputLabel>
                <Select
                  value={formData.type}
                  label="ประเภท OT"
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {otTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Typography>{type.label}</Typography>
                        <Chip label={type.rate} size="small" color="primary" />
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="เหตุผลในการขอ OT"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                error={!!errors.description}
                helperText={errors.description || 'กรุณาระบุเหตุผลอย่างละเอียด'}
                placeholder="เช่น งานเร่งด่วน, ปิดโปรเจค, แก้ไขปัญหาระบบ"
              />
            </Grid>

            {/* ปุ่มดำเนินการ */}
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  ล้างข้อมูล
                </Button>

                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSubmit}
                  sx={{ minWidth: 120 }}
                >
                  {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {renderOTSummary()}
      {renderForm()}
    </Box>
  );
}
