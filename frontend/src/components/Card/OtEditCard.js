import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Divider,
  Chip,
  Stack,
  Avatar,
  Paper,
  useTheme,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
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

export default function OtEditCard({
  otRequestOrder,
  rate,
  setRate,
  handleOpenModal,
}) {
  if (!otRequestOrder) {
    return (
      <Card>
        <CardContent>
          <Typography>กำลังโหลดข้อมูล...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Header Card */}

      {/* OT Details */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
          }}
        >
          <CardContent>
            <Box className={'flex justify-between'}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <AssignmentIcon color="primary" />
                รายละเอียด OT
              </Typography>
              <div>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleOpenModal}
                >
                  แก้ไข
                </Button>
              </div>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  วันที่ทำ OT
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body1">
                    {otRequestOrder?.date
                      ? dayjs(otRequestOrder.date).format('DD/MM/YYYY')
                      : '-'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  เวลา
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body1">
                    {dayjs(otRequestOrder.startTime).format('HH:mm')} -{' '}
                    {dayjs(otRequestOrder.endTime).format('HH:mm')}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  จำนวนชั่วโมง
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="body1" fontWeight={500}>
                    {otRequestOrder?.total_hours?.toFixed(1) || 0} ชั่วโมง
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  เรท
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight={500}>
                    x{otRequestOrder?.rate}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  สาเหตุการทำ OT
                </Typography>
                <Typography variant="body1">
                  {otRequestOrder?.description || '-'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Project Info */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BusinessIcon color="primary" />
              ข้อมูลโครงการ
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  รหัสโครงการ
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {otRequestOrder?.project?.project_number || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  ชื่อโครงการ
                </Typography>
                <Typography variant="body1">
                  {otRequestOrder?.project?.name || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  ลูกค้า
                </Typography>
                <Typography variant="body1">
                  {otRequestOrder?.project?.customer || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  สถานที่
                </Typography>
                <Typography variant="body1">
                  {otRequestOrder?.project?.location || '-'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
