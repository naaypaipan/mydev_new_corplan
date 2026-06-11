/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  Box,
  Card,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  Divider,
  Stack,
  Container,
  Paper,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  CameraAlt as CameraIcon,
  AddToPhotos as OTIcon,
  Logout as LogoutIcon,
  WorkHistory as WorkIcon,
} from '@mui/icons-material';
import { OT_STATUS } from 'utils/constants';
import MainTimeStamp from './TimeStampMain';

export default function ListTimestamp({ timestamp, setOpen }) {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('th'),
  );
  const history = useHistory();
  const profile = useSelector((state) => state.me?.userData);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('th'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timestamp?._id) return <MainTimeStamp />;

  // otRequests อาจเป็น array หรือ object เดียว
  const otRequests = Array.isArray(timestamp.otRequests)
    ? timestamp.otRequests
    : timestamp.otRequest
    ? [timestamp.otRequest]
    : [];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
        }}
      >
        {/* Time Header */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #FF7300FF 0%, #FFA600FF 100%)',
            color: 'white',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={profile?.image?.url}
                sx={{ width: 56, height: 56, border: '2px solid white' }}
              />
              <Box>
                <Typography variant="h6">
                  {profile?.firstname} {profile?.lastname}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {profile?.department?.name}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <TimeIcon />
              <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                {currentTime}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 3 }}>
          <Stack spacing={1}>
            {/* Status Section */}
            <Box
              sx={{
                p: 2,
                bgcolor: timestamp?.late_status ? '#fff3e0' : '#e8f5e9',
                borderRadius: 2,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <WorkIcon
                    color={timestamp?.late_status ? 'warning' : 'success'}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      สถานะการเข้างาน
                    </Typography>
                    <Typography variant="h6">
                      {dayjs(timestamp?.checkIn).format('HH:mm น.')}
                    </Typography>
                  </Box>
                </Stack>
                {timestamp?.late_status && (
                  <Chip label="เข้างานสาย" color="warning" variant="outlined" />
                )}
              </Stack>
            </Box>

            {/* OT Status */}
            {timestamp?.ot_status?.require && (
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>สถานะ OT</Typography>
                  <Chip
                    label={
                      OT_STATUS?.[timestamp?.ot_status?.status]?.status_code
                    }
                    color={OT_STATUS?.[timestamp?.ot_status?.status]?.color}
                    variant="outlined"
                  />
                </Stack>
              </Card>
            )}

            {/* OT Request Info */}
            {otRequests.length > 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#f3f6fa',
                  borderColor: '#ffa600',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  รายการขอ OT
                </Typography>
                <Stack spacing={1}>
                  {otRequests.map((ot, idx) => (
                    <Box key={ot._id || idx} sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={
                            OT_STATUS?.[ot.status]?.status_code || ot.status
                          }
                          color={OT_STATUS?.[ot.status]?.color || 'default'}
                          size="small"
                          variant="filled"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {ot?.description || '-'}
                        </Typography>
                      </Stack>
                      <Typography variant="caption">
                        วันที่ขอ:{' '}
                        {ot?.date ? dayjs(ot.date).format('DD/MM/YYYY') : '-'}
                        {ot?.startTime && ot?.endTime
                          ? ` (${dayjs(ot.startTime).format('HH:mm')} - ${dayjs(
                              ot.endTime,
                            ).format('HH:mm')})`
                          : ''}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Check-in Photo */}
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, overflow: 'hidden' }}
            >
              <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CameraIcon color="primary" />
                  <Typography>ภาพถ่ายเช็คอิน</Typography>
                </Stack>
              </Box>
              <Divider />
              <Box sx={{ p: 2 }}>
                <img
                  src={timestamp?.image?.url}
                  alt="Check-in"
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    maxHeight: 300,
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Card>

            {/* Action Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                startIcon={<OTIcon />}
                onClick={() => history.push(`/profile/ot/add`)}
                disabled={otRequests.length > 0}
                sx={{ py: 1.5 }}
              >
                ขอ OT
              </Button>

              <Button
                fullWidth
                variant="contained"
                color="error"
                size="large"
                startIcon={<LogoutIcon />}
                onClick={() =>
                  history.push(`/profile/timestamp/Check-out/${timestamp?._id}`)
                }
                sx={{ py: 1.5 }}
              >
                ลงเวลาออกงาน
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </Container>
  );
}
