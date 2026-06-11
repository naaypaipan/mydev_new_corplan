import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HomeNavbar } from '../components/Nevbars/index';
import { MainFooter } from '../components/Footers';
import { MainSidebar } from '../components/Sidebar';
import { NotFound } from '../components/Error';
import { CreateDropletProject } from './Monitor';
import * as actions from '../redux/actions';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  AccountBalance as ExpenseIcon,
  ArrowForward as ArrowForwardIcon,
  AccountBalance,
} from '@mui/icons-material';
import Loading from 'components/Loading';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const menuCards = [
  {
    title: 'ลงเวลาเข้างาน',
    icon: <TimeIcon sx={{ fontSize: 32 }} />,
    path: '/profile/timestamp',
    color: 'primary',
    description: 'บันทึกเวลาเข้า-ออกงาน และขอโอที',
  },
  {
    title: 'เบิกจ่าย',
    icon: <ExpenseIcon sx={{ fontSize: 32 }} />,
    path: '/profile/disbursement',
    color: 'secondary',
    description: 'จัดการค่าใช้จ่าย และการเบิกจ่าย',
  },
];

export default function Home() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const me = useSelector((state) => state.me);

  useEffect(() => {
    dispatch(actions.meGet({}));
    setIsLoading(true);
  }, []);

  useEffect(() => {
    dispatch(actions.meGet({}));
  }, [isLoading]);

  if (!me?.isLoading && me?.isCompleted) {
    return (
      <Box className="min-h-screen bg-slate-50">
        <MainSidebar
          onMobileClose={() => setMobileNavOpen(false)}
          openMobile={isMobileNavOpen}
          me={me}
        />
        <HomeNavbar onMobileNavOpen={() => setMobileNavOpen(true)} />

        <Box className="ml-0 lg:ml-64">
          <Container maxWidth="xl" className="py-8">
            {/* Header Section - Modern & Minimal */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                mb: 5,
                // backgroundImage:
                //   'linear-gradient(135deg, #0061f2 0%, #6610f2 100%)',
                // color: 'white',
              }}
            >
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  position: 'relative',
                  zIndex: 2,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          opacity: 0.8,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                        }}
                      >
                        {dayjs().locale('th').format('DD MMMM YYYY')}
                      </Typography>
                      <Typography
                        variant="h4"
                        color={theme.palette.primary.main}
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        สวัสดี | {me?.userData?.firstname || 'ผู้ใช้งาน'}{' '}
                        {me?.userData?.lastname || 'ผู้ใช้งาน'}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ opacity: 0.9, maxWidth: '90%' }}
                      >
                        ยินดีต้อนรับสู่ระบบบริหารจัดการ COREPLAN ERP
                        คุณสามารถเข้าถึงเมนูหลักได้ด้านล่าง
                      </Typography>

                      {/* Status Chip */}
                      <Chip
                        icon={
                          <TimeIcon
                            fontSize="small"
                            sx={{ color: 'white !important' }}
                          />
                        }
                        label={`เข้างานล่าสุด: ${dayjs().format('HH:mm น.')}`}
                        sx={{
                          mt: 2,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          '& .MuiChip-label': { fontWeight: 500 },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={4}
                    sx={{ display: { xs: 'none', md: 'block' } }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    ></Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Decorative pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '70%',
                  height: '100%',
                  opacity: 0.05,
                  zIndex: 1,
                }}
              ></Box>

              {/* Decorative circles */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  zIndex: 1,
                }}
              />
            </Paper>

            {/* Daily Stats */}

            {/* Menu Cards - Modern & Minimal */}
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                เมนูหลัก
              </Typography>

              <Grid container spacing={3}>
                {menuCards.map((card, index) => (
                  <Grid item xs={12} md={6} key={card.title}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                          '& .arrow-icon': {
                            transform: 'translateX(3px)',
                          },
                          '& .card-overlay': {
                            opacity: 0.95,
                          },
                        },
                      }}
                    >
                      <Link to={card.path} style={{ textDecoration: 'none' }}>
                        {/* Background & Overlay */}
                        <Box
                          className="card-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(45deg, ${
                              theme.palette[card.color].main
                            } 30%, ${theme.palette[card.color].light} 100%)`,
                            opacity: 0.9,
                            zIndex: 1,
                            transition: 'opacity 0.3s',
                          }}
                        />

                        {/* Content */}
                        <Box
                          sx={{
                            position: 'relative',
                            zIndex: 2,
                            p: 4,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              p: 1.5,
                              borderRadius: 2,
                              mb: 2,
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                            }}
                          >
                            {card.icon}
                          </Box>

                          <Typography
                            variant="h5"
                            sx={{ color: 'white', fontWeight: 600, mb: 1 }}
                          >
                            {card.title}
                          </Typography>

                          <Typography
                            variant="body1"
                            sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          >
                            {card.description}
                          </Typography>

                          <Stack
                            direction="row"
                            alignItems="center"
                            sx={{ mt: 'auto', pt: 3 }}
                          >
                            <Typography
                              variant="button"
                              sx={{ color: 'white', fontWeight: 500 }}
                            >
                              เข้าใช้งาน
                            </Typography>
                            <ArrowForwardIcon
                              className="arrow-icon"
                              fontSize="small"
                              sx={{
                                ml: 0.5,
                                color: 'white',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </Stack>
                        </Box>
                      </Link>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-slate-50">
      <Loading />
    </Box>
  );
}
