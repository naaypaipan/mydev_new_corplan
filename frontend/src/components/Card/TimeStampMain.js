import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Paper,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

const TimeStampMain = () => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('th-TH'),
  );
  const profile = useSelector((state) => state.me?.userData);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('th-TH'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          minHeight: '40vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
        }}
      >
        {/* Left Panel - Profile Info */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 3,
            bgcolor: 'primary.dark',
            color: 'white',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              src={profile?.image?.url}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                mb: 2,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {profile?.firstname} {profile?.lastname}
            </Typography>
            <Chip
              label={profile?.department?.name || 'Department'}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '.MuiChip-label': { px: 2 },
              }}
            />
          </Box>
        </Paper>

        {/* Right Panel - Check In */}
        <Paper
          elevation={0}
          sx={{
            flex: 2,
            p: 4,
            borderRadius: 4,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography color="text.secondary">TimeStamp Check In</Typography>
          </Box>

          <Paper
            sx={{
              p: 3,
              mb: 4,
              bgcolor: 'grey.50',
              borderRadius: 3,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              alignItems="center"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon color="primary" />
                <Typography variant="h6">
                  {dayjs().format('DD MMMM YYYY')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ClockIcon color="primary" />
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                  }}
                >
                  {currentTime}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Box sx={{ mt: 'auto' }}>
            <Link
              to="/profile/timestamp/check-In"
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  py: 3,
                  borderRadius: 3,
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark',
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s',
                  },
                }}
                startIcon={<ClockIcon />}
              >
                <Typography variant="h6">ลงเวลาเข้างาน</Typography>
              </Button>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TimeStampMain;
